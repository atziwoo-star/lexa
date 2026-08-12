import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exchangeCodeForTokens } from "@/lib/google";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.rol !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const tokens = await exchangeCodeForTokens(code);

  if (!tokens.refresh_token) {
    return new NextResponse(
      "No refresh_token returned — Google only issues one the first time an app is authorized. Revoke Lexa's access at https://myaccount.google.com/permissions for this account and try /api/google/connect again.",
      { status: 200 },
    );
  }

  // Shown once, on purpose: this value needs to be copied into
  // GOOGLE_REFRESH_TOKEN (local .env and Vercel) and is never stored by the
  // app itself. Not logged, not persisted to the database.
  return new NextResponse(
    `Copy this value into GOOGLE_REFRESH_TOKEN:\n\n${tokens.refresh_token}`,
    { status: 200, headers: { "Content-Type": "text/plain" } },
  );
}
