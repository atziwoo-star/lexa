import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const promoteSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.rol !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { userId } = promoteSchema.parse(await request.json());

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Teachers keep a Teacher row with slots and bookings; switching their role
  // would orphan those, so only students can be promoted.
  if (target.rol !== "ALUMNO") {
    return NextResponse.json(
      { error: "This user is not a student" },
      { status: 409 },
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { rol: "ADMIN" },
  });

  return NextResponse.json({ ok: true });
}
