import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingsList, type BookingForClient } from "@/components/bookings-list";
import { BookClassPanel } from "@/components/book-class-panel";
import { BuyHoursPanel } from "@/components/buy-hours-panel";
import { SignOutButton } from "@/components/sign-out-button";

export default async function StudentPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ALUMNO") redirect("/login");

  const { purchase } = await searchParams;

  const [hourPackages, bookings] = await Promise.all([
    prisma.hourPackage.findMany({
      where: { userId: user.id, fechaVencimiento: { gte: new Date() } },
    }),
    prisma.booking.findMany({
      where: { userId: user.id, estado: "CONFIRMADA" },
      include: { slot: { include: { teacher: { include: { user: true } } } } },
      orderBy: { slot: { inicioUtc: "asc" } },
    }),
  ]);

  const hoursBalance = hourPackages.reduce(
    (total, pkg) =>
      total + Number(pkg.horasCompradas) - Number(pkg.horasConsumidas),
    0,
  );

  const bookingsForClient: BookingForClient[] = bookings.map((booking) => ({
    id: booking.id,
    slotId: booking.slotId,
    idioma: booking.slot.idioma,
    inicioUtc: booking.slot.inicioUtc.toISOString(),
    finUtc: booking.slot.finUtc.toISOString(),
    fechaLimiteCancelacion: booking.fechaLimiteCancelacion.toISOString(),
    teacherName: booking.slot.teacher.user.nombre,
  }));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My account</h1>
          <p className="text-sm text-neutral-600">{user.nombre}</p>
        </div>
        <SignOutButton />
      </header>

      {purchase === "success" && (
        <p className="rounded border border-green-600 bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950">
          Payment received — your hours have been added below.
        </p>
      )}
      {purchase === "cancelled" && (
        <p className="rounded border px-3 py-2 text-sm text-neutral-600">
          Checkout was cancelled — no charge was made.
        </p>
      )}

      <section>
        <p className="text-sm text-neutral-600">Hours available</p>
        <p className="text-3xl font-semibold">{hoursBalance}</p>
        <div className="mt-3">
          <BuyHoursPanel />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Upcoming classes</h2>
        <BookingsList initialBookings={bookingsForClient} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Book a class</h2>
        <BookClassPanel />
      </section>
    </main>
  );
}
