"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { idiomaLabels } from "@/lib/labels";

const idiomaOptions = Object.keys(idiomaLabels) as (keyof typeof idiomaLabels)[];
const timezones =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["UTC"];
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function PromoteStudentButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [idiomas, setIdiomas] = useState<string[]>([]);
  const [zonaHoraria, setZonaHoraria] = useState(browserTimezone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleIdioma(idioma: string) {
    setIdiomas((prev) =>
      prev.includes(idioma) ? prev.filter((i) => i !== idioma) : [...prev, idioma],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/teachers/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, idiomas, zonaHoraria }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to promote");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-indigo-600 underline"
      >
        Promote to teacher
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-xs">
      <div className="flex flex-wrap gap-2">
        {idiomaOptions.map((idioma) => (
          <label key={idioma} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={idiomas.includes(idioma)}
              onChange={() => toggleIdioma(idioma)}
            />
            {idiomaLabels[idioma]}
          </label>
        ))}
      </div>
      <select
        value={zonaHoraria}
        onChange={(e) => setZonaHoraria(e.target.value)}
        className="rounded border px-2 py-1"
      >
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || idiomas.length === 0}
          className="rounded bg-indigo-600 px-2 py-1 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Confirm"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="underline">
          Cancel
        </button>
      </div>
    </form>
  );
}
