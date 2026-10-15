"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MakeAdminButton({
  userId,
  nombre,
}: {
  userId: string;
  nombre: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (
      !window.confirm(
        `Make ${nombre} an admin? They'll get full access to this dashboard and will no longer appear as a student.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/admins/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      setError(data.error ?? "Failed to make admin");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs text-indigo-600 underline transition-colors hover:text-indigo-500 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Make admin"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
