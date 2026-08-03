import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const idiomaSchema = z.enum(["INGLES", "ESPANOL", "COREANO"]);

const createSlotSchema = z.object({
  idioma: idiomaSchema,
  inicioUtc: z.iso.datetime(),
  finUtc: z.iso.datetime(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idiomaParam = searchParams.get("idioma");
  const teacherId = searchParams.get("teacherId") ?? undefined;

  const idioma = idiomaParam
    ? idiomaSchema.parse(idiomaParam.toUpperCase())
    : undefined;

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      idioma,
      teacherId,
      inicioUtc: { gte: new Date() },
    },
    include: {
      bookings: { where: { estado: "CONFIRMADA" } },
      teacher: { include: { user: { select: { nombre: true } } } },
    },
    orderBy: { inicioUtc: "asc" },
  });

  const disponibles = slots.filter(
    (slot) => slot.bookings.length < slot.capacidadMax,
  );

  return NextResponse.json(disponibles);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
  });
  if (!teacher) {
    return NextResponse.json(
      { error: "Only teachers can publish availability" },
      { status: 403 },
    );
  }

  const body = createSlotSchema.parse(await request.json());
  const inicioUtc = new Date(body.inicioUtc);
  const finUtc = new Date(body.finUtc);

  if (finUtc <= inicioUtc) {
    return NextResponse.json(
      { error: "End time must be after start time" },
      { status: 400 },
    );
  }
  if (inicioUtc <= new Date()) {
    return NextResponse.json(
      { error: "Start time must be in the future" },
      { status: 400 },
    );
  }
  if (!teacher.idiomas.includes(body.idioma)) {
    return NextResponse.json(
      { error: "You don't teach this language" },
      { status: 400 },
    );
  }

  const slot = await prisma.availabilitySlot.create({
    data: {
      teacherId: teacher.id,
      idioma: body.idioma,
      inicioUtc,
      finUtc,
    },
  });

  return NextResponse.json(slot, { status: 201 });
}
