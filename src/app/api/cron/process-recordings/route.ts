import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { getConferenceRecordingFile, shareRecording, deleteRecording } from "@/lib/google";

const RETENTION_DAYS = 14;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const attached = await attachReadyRecordings();
  const expired = await expireOldRecordings();

  return NextResponse.json({ attached, expired });
}

async function attachReadyRecordings() {
  const sessions = await prisma.classSession.findMany({
    where: {
      meetConferenceId: { not: null },
      grabacionEstado: { in: ["NO_DISPONIBLE", "PROCESANDO"] },
      slot: { finUtc: { lt: new Date() } },
    },
    include: {
      slot: {
        include: {
          teacher: { include: { user: true } },
          bookings: { where: { estado: "CONFIRMADA" }, include: { user: true } },
        },
      },
    },
  });

  let attached = 0;

  for (const session of sessions) {
    if (session.estado === "EN_CURSO") {
      await prisma.classSession.update({
        where: { id: session.id },
        data: { estado: "FINALIZADA" },
      });
    }

    const fileId = await getConferenceRecordingFile(session.meetConferenceId!);

    if (!fileId) {
      if (session.grabacionEstado !== "PROCESANDO") {
        await prisma.classSession.update({
          where: { id: session.id },
          data: { grabacionEstado: "PROCESANDO" },
        });
      }
      continue;
    }

    const emails = [
      session.slot.teacher.user.email,
      ...session.slot.bookings.map((b) => b.user.email),
    ];
    const expiresAt = DateTime.now().plus({ days: RETENTION_DAYS }).toJSDate();
    const webViewLink = await shareRecording(fileId, emails, expiresAt);

    await prisma.classSession.update({
      where: { id: session.id },
      data: {
        grabacionUrl: webViewLink,
        grabacionDriveFileId: fileId,
        grabacionCompartidaAt: new Date(),
        grabacionEstado: "DISPONIBLE",
      },
    });
    attached++;
  }

  return attached;
}

async function expireOldRecordings() {
  const cutoff = DateTime.now().minus({ days: RETENTION_DAYS }).toJSDate();

  const sessions = await prisma.classSession.findMany({
    where: {
      grabacionEstado: "DISPONIBLE",
      grabacionCompartidaAt: { lt: cutoff },
    },
  });

  for (const session of sessions) {
    if (session.grabacionDriveFileId) {
      await deleteRecording(session.grabacionDriveFileId);
    }
    await prisma.classSession.update({
      where: { id: session.id },
      data: { grabacionUrl: null, grabacionEstado: "ELIMINADA" },
    });
  }

  return sessions.length;
}
