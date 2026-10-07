import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/change-password-form";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dashboardPath =
    user.rol === "PROFESOR" ? "/teacher" : user.rol === "ADMIN" ? "/admin" : "/student";

  return (
    <main className="animate-fade-in-up mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Account settings</h1>
          <p className="text-sm text-neutral-600">{user.nombre}</p>
        </div>
        <SignOutButton />
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Change password</h2>
        <ChangePasswordForm email={user.email} />
      </section>

      <Link
        href={dashboardPath}
        className="text-sm text-neutral-600 underline transition-colors hover:text-foreground"
      >
        ← Back to dashboard
      </Link>
    </main>
  );
}
