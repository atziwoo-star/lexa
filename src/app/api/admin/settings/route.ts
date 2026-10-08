import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  precioPorHoraUsd: z.number().positive().max(1000),
});

export async function PATCH(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.rol !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { precioPorHoraUsd } = settingsSchema.parse(await request.json());

  await prisma.appSettings.update({
    where: { id: "default" },
    data: { precioPorHoraUsd },
  });

  return NextResponse.json({ ok: true });
}
