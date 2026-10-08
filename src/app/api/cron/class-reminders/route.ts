import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { idiomaLabels } from "@/lib/labels";

// Not called by Vercel Cron — the Hobby plan only allows daily schedules,
// too coarse for a "class starts soon" reminder. An external scheduler
// (cron-job.org or similar) hits this every ~10 minutes instead, same
// CRON_SECRET auth as the Vercel-triggered crons.
//
// Window picked so a slot is caught exactly once even if the external
// cron's actual interval drifts a bit: as long as the interval is shorter
// than the window, every slot falls inside it on at least one run.
const REMINDER_WINDOW_START_MINUTES = 15;
const REMINDER_WINDOW_END_MINUTES = 30;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const now = DateTime.now();
  const windowStart = now.plus({ minutes: REMINDER_WINDOW_START_MINUTES }).toJSDate();
  const windowEnd = now.plus({ minutes: REMINDER_WINDOW_END_MINUTES }).toJSDate();

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      recordatorioEnviado: false,
      inicioUtc: { gte: windowStart, lte: windowEnd },
    },
    include: {
      teacher: { include: { user: true } },
      bookings: { where: { estado: "CONFIRMADA" }, include: { user: true } },
    },
  });

  let notified = 0;

  for (const slot of slots) {
    const minutesUntil = Math.round(
      DateTime.fromJSDate(slot.inicioUtc).diff(now, "minutes").minutes,
    );
    const languageLabel = idiomaLabels[slot.idioma] ?? slot.idioma;

    await sendPushToUser(slot.teacher.user.id, {
      title: "Your class starts soon",
      body: `${languageLabel} class starts in about ${minutesUntil} minutes.`,
      url: "/teacher",
    });

    for (const booking of slot.bookings) {
      await sendPushToUser(booking.user.id, {
        title: "Your class starts soon",
        body: `${languageLabel} class with ${slot.teacher.user.nombre} starts in about ${minutesUntil} minutes.`,
        url: "/student",
      });
    }

    await prisma.availabilitySlot.update({
      where: { id: slot.id },
      data: { recordatorioEnviado: true },
    });
    notified++;
  }

  return NextResponse.json({ notified });
}
