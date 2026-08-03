import { NextResponse } from "next/server";
import { z } from "zod";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createBookingSchema = z.object({
  slotId: z.string(),
});

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, estado: "CONFIRMADA" },
    include: {
      slot: { include: { teacher: { include: { user: true } } } },
    },
    orderBy: { slot: { inicioUtc: "asc" } },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slotId } = createBookingSchema.parse(await request.json());

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: slotId },
        include: { bookings: { where: { estado: "CONFIRMADA" } } },
      });

      if (!slot) throw new ApiError(404, "Slot not found");
      if (slot.inicioUtc <= new Date()) {
        throw new ApiError(400, "This slot has already started");
      }
      if (slot.bookings.some((b) => b.userId === user.id)) {
        throw new ApiError(409, "You already booked this slot");
      }
      if (slot.bookings.length >= slot.capacidadMax) {
        throw new ApiError(409, "Slot is full");
      }

      const hourPackages = await tx.hourPackage.findMany({
        where: { userId: user.id, fechaVencimiento: { gte: new Date() } },
        orderBy: { fechaVencimiento: "asc" },
      });
      const hourPackage = hourPackages.find(
        (pkg) => Number(pkg.horasCompradas) - Number(pkg.horasConsumidas) >= 1,
      );

      if (!hourPackage) {
        throw new ApiError(402, "You don't have any hours available");
      }

      await tx.hourPackage.update({
        where: { id: hourPackage.id },
        data: { horasConsumidas: { increment: 1 } },
      });

      return tx.booking.create({
        data: {
          slotId,
          userId: user.id,
          hourPackageId: hourPackage.id,
          fechaLimiteCancelacion: DateTime.fromJSDate(slot.inicioUtc)
            .minus({ hours: 24 })
            .toJSDate(),
        },
      });
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
