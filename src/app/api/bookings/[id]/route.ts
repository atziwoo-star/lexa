import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.estado !== "CONFIRMADA") {
    return NextResponse.json(
      { error: "This booking is already cancelled" },
      { status: 409 },
    );
  }

  // Free cancellation up to 24h before class; after that the hour is still consumed.
  const refunded = new Date() < booking.fechaLimiteCancelacion;

  await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { estado: "CANCELADA" },
    }),
    ...(refunded
      ? [
          prisma.hourPackage.update({
            where: { id: booking.hourPackageId },
            data: { horasConsumidas: { decrement: booking.horasConsumidas } },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ refunded });
}
