"use client";

import { useState } from "react";

const PRICE_PER_HOUR_USD = 20;

export function BuyHoursPanel() {
  const [horas, setHoras] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horas }),
    });
    const data = await res.json();

    if (!res.ok || !data.url) {
      setLoading(false);
      setError(data.error ?? "Could not start checkout");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-600">Hours</label>
        <input
          type="number"
          min={1}
          max={100}
          value={horas}
          onChange={(e) => setHoras(Math.max(1, Number(e.target.value)))}
          className="w-24 rounded border px-3 py-2 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>
      <p className="pb-2 text-sm text-neutral-600">
        Total: ${(horas * PRICE_PER_HOUR_USD).toFixed(2)} USD
      </p>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="rounded bg-indigo-600 px-4 py-2 text-sm text-white transition-all hover:scale-[1.03] hover:bg-indigo-500 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
      >
        {loading ? "Redirecting..." : "Buy hours"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
