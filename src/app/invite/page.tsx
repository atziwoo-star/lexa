"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InvitePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function establishSession() {
      const supabase = createClient();

      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hashError = hashParams.get("error_description");
      if (hashError) {
        setError(hashError.replace(/\+/g, " "));
        setReady(true);
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) setError(error.message);
        setReady(true);
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setError(error.message);
        setReady(true);
        return;
      }

      setReady(true);
    }

    establishSession();
  }, []);

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
      {!ready ? (
        <p className="text-sm text-neutral-600">Verifying your invite link...</p>
      ) : (
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
      )}
    </main>
  );
}
