import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

const inviteSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(1),
});

export async function POST(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.rol !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { email, nombre } = inviteSchema.parse(await request.json());

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/invite`,
    data: { nombre },
  });

  if (error || !data.user) {
    const alreadyExists = error?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      {
        error: alreadyExists
          ? "This email is already registered — use \"Make admin\" on their student row instead."
          : error?.message ?? "Failed to send invite",
      },
      { status: alreadyExists ? 409 : 500 },
    );
  }

  await prisma.user.update({
    where: { id: data.user.id },
    data: { rol: "ADMIN" },
  });

  return NextResponse.json({ ok: true });
}
