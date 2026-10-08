"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditPricingForm({ precioPorHoraUsd }: { precioPorHoraUsd: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(precioPorHoraUsd));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precioPorHoraUsd: Number(value) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-neutral-600">
          Current price: <span className="font-medium text-foreground">${precioPorHoraUsd}/hour</span>
        </p>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-indigo-600 underline transition-colors hover:text-indigo-500"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <span className="text-sm text-neutral-600">$</span>
      <input
        type="number"
        step="0.01"
        min="0.01"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 rounded border px-2 py-1 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
      />
      <span className="text-sm text-neutral-600">/hour</span>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-indigo-600 px-2 py-1 text-xs text-white transition-all hover:scale-105 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onClick={() => {
          setEditing(false);
          setValue(String(precioPorHoraUsd));
          setError(null);
        }}
        className="text-xs underline transition-colors hover:text-neutral-600"
      >
        Cancel
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
