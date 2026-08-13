import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMeetEvent } from "@/lib/google";
import { isClassJoinable } from "@/lib/class-join-window";
import { idiomaLabels } from "@/lib/labels";

export default async function ClassPage({
  params,
}: {
  params: Promise<{ slotId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dashboardPath =
    user.rol === "PROFESOR" ? "/teacher" : user.rol === "ADMIN" ? "/admin" : "/student";

  const { slotId } = await params;

  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      teacher: { include: { user: true } },
      bookings: { where: { estado: "CONFIRMADA" }, include: { user: true } },
    },
  });

  if (!slot) redirect(dashboardPath);

  const isTeacher = slot.teacher.userId === user.id;
  const isStudent = slot.bookings.some((b) => b.userId === user.id);
  if (!isTeacher && !isStudent) redirect(dashboardPath);

  if (!isClassJoinable(slot.inicioUtc, slot.finUtc)) redirect(dashboardPath);

  let classSession = await prisma.classSession.findUnique({ where: { slotId } });

  if (!classSession) {
    const attendees = [
      slot.teacher.user.email,
      ...slot.bookings.map((b) => b.user.email),
    ];

    const meetEvent = await createMeetEvent({
      summary: `${idiomaLabels[slot.idioma]} class with ${slot.teacher.user.nombre}`,
      startTimeIso: slot.inicioUtc.toISOString(),
      endTimeIso: slot.finUtc.toISOString(),
      attendees,
    });

    classSession = await prisma.classSession.create({
      data: {
        slotId,
        meetEventId: meetEvent.eventId,
        meetUrl: meetEvent.meetUrl,
        estado: "EN_CURSO",
      },
    });
  }

  redirect(classSession.meetUrl!);
}
