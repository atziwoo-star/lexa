import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google";

// One-time admin bootstrap: authorizes Lexa to create Meet-enabled Calendar
// events as the clases@lexalab.net organizer account. Not part of any
// regular user flow — only an admin can trigger it.
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  return NextResponse.redirect(getGoogleAuthUrl());
}
