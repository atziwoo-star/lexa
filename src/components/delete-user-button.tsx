"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteUserButton({
  userId,
  nombre,
}: {
  userId: string;
  nombre: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete ${nombre}? This permanently removes their account, bookings, hour packages, and payment history. This can't be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      setError(data.error ?? "Failed to delete");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-600 underline transition-colors hover:text-red-500 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
