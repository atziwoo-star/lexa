"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InvitePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/teacher";
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Welcome to Lexa</h1>
      <p className="text-sm text-neutral-600">
        Set a password to finish setting up your teacher account.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border px-3 py-2"
        />
        {error && (
          <p className="text-sm text-red-600">
            {error} — if this link expired, ask your admin to invite you again.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-indigo-600 px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Set password and continue"}
        </button>
      </form>
    </main>
  );
}
