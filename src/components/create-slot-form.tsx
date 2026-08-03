"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";
import { idiomaLabels } from "@/lib/labels";

export function CreateSlotForm({ idiomas }: { idiomas: string[] }) {
  const router = useRouter();
  const [idioma, setIdioma] = useState(idiomas[0] ?? "INGLES");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const inicioLocal = DateTime.fromISO(`${date}T${startTime}`);
    const finLocal = DateTime.fromISO(`${date}T${endTime}`);

    if (!inicioLocal.isValid || !finLocal.isValid) {
      setError("Please fill in a valid date and time");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idioma,
        inicioUtc: inicioLocal.toUTC().toISO(),
        finUtc: finLocal.toUTC().toISO(),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not create this slot");
      return;
    }

    setDate("");
    setStartTime("");
    setEndTime("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-600">Language</label>
        <select
          value={idioma}
          onChange={(e) => setIdioma(e.target.value)}
          className="rounded border px-3 py-2"
        >
          {idiomas.map((value) => (
            <option key={value} value={value}>
              {idiomaLabels[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-600">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-600">Start</label>
        <input
          type="time"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-600">End</label>
        <input
          type="time"
          required
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish slot"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
