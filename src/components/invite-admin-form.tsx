"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteAdminForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !window.confirm(
        `Invite ${email} as an admin? Admins have full access: students, teachers, payments, pricing, and deleting accounts.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/admin/admins/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to send invite");
      return;
    }

    setMessage(`Invite sent to ${email}.`);
    setNombre("");
    setEmail("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded border p-4 transition-colors focus-within:border-indigo-300"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded bg-indigo-600 px-3 py-1.5 text-sm text-white transition-all hover:scale-[1.03] hover:bg-indigo-500 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        {loading ? "Sending..." : "Send admin invite"}
      </button>
    </form>
  );
}
