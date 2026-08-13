import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateSlotForm } from "@/components/create-slot-form";
import {
  TeacherSlotsList,
  type TeacherSlotForClient,
} from "@/components/teacher-slots-list";
import { SignOutButton } from "@/components/sign-out-button";
import { PastClassesList, type PastClassForClient } from "@/components/past-classes-list";

export default async function TeacherPage() {
  const user = await getCurrentUser();
  if (!user || user.rol !== "PROFESOR") redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
  });
  if (!teacher) redirect("/login");

  const [slots, pastSlots] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: { teacherId: teacher.id, finUtc: { gte: new Date() } },
      include: {
        bookings: { where: { estado: "CONFIRMADA" }, include: { user: true } },
      },
      orderBy: { inicioUtc: "asc" },
    }),
    prisma.availabilitySlot.findMany({
      where: { teacherId: teacher.id, finUtc: { lt: new Date() } },
      include: {
        bookings: { where: { estado: "CONFIRMADA" }, include: { user: true } },
        classSession: true,
      },
      orderBy: { inicioUtc: "desc" },
    }),
  ]);

  const slotsForClient: TeacherSlotForClient[] = slots.map((slot) => ({
    id: slot.id,
    idioma: slot.idioma,
    inicioUtc: slot.inicioUtc.toISOString(),
    finUtc: slot.finUtc.toISOString(),
    capacidadMax: slot.capacidadMax,
    studentNames: slot.bookings.map((b) => b.user.nombre),
  }));

  const pastClassesForClient: PastClassForClient[] = pastSlots.map((slot) => ({
    id: slot.id,
    idioma: slot.idioma,
    inicioUtc: slot.inicioUtc.toISOString(),
    withLabel:
      slot.bookings.length > 0
        ? `with ${slot.bookings.map((b) => b.user.nombre).join(", ")}`
        : "no students booked",
    grabacionEstado: slot.classSession?.grabacionEstado ?? "NO_DISPONIBLE",
    grabacionUrl: slot.classSession?.grabacionUrl ?? null,
  }));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Teacher dashboard</h1>
          <p className="text-sm text-neutral-600">{user.nombre}</p>
        </div>
        <SignOutButton />
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Publish availability</h2>
        <CreateSlotForm idiomas={teacher.idiomas} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Upcoming classes</h2>
        <TeacherSlotsList slots={slotsForClient} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Past classes</h2>
        <PastClassesList classes={pastClassesForClient} />
      </section>
    </main>
  );
}
