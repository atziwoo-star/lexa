import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JitsiRoom } from "@/components/jitsi-room";
import { isClassJoinable } from "@/lib/class-join-window";

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
      teacher: true,
      bookings: { where: { estado: "CONFIRMADA" } },
    },
  });

  if (!slot) redirect(dashboardPath);

  const isTeacher = slot.teacher.userId === user.id;
  const isStudent = slot.bookings.some((b) => b.userId === user.id);
  if (!isTeacher && !isStudent) redirect(dashboardPath);

  if (!isClassJoinable(slot.inicioUtc, slot.finUtc)) redirect(dashboardPath);

  const classSession = await prisma.classSession.upsert({
    where: { slotId },
    create: {
      slotId,
      salaJitsiId: `lexa-${randomUUID()}`,
      estado: "EN_CURSO",
    },
    update: {},
  });

  return (
    <div className="h-dvh w-full">
      <JitsiRoom
        domain={process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si"}
        roomName={classSession.salaJitsiId}
        displayName={user.nombre}
        email={user.email}
      />
    </div>
  );
}
