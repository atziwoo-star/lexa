import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const idiomaSchema = z.enum(["INGLES", "ESPANOL", "COREANO"]);

const editSchema = z.object({
  idiomas: z.array(idiomaSchema).min(1),
  zonaHoraria: z.string().min(1),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentUser();
  if (!admin || admin.rol !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  const { idiomas, zonaHoraria } = editSchema.parse(await request.json());

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.teacher.update({
      where: { id },
      data: { idiomas, zonaHoraria },
    }),
    prisma.user.update({
      where: { id: teacher.userId },
      data: { idiomas, zonaHoraria },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
