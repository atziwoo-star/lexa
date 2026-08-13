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

export function InviteTeacherForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [idiomas, setIdiomas] = useState<string[]>([]);
  const [zonaHoraria, setZonaHoraria] = useState(browserTimezone);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
    setMessage(null);

    const res = await fetch("/api/admin/teachers/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, idiomas, zonaHoraria }),
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
    setIdiomas([]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          required
          placeholder="Name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {idiomaOptions.map((idioma) => (
          <label key={idioma} className="flex items-center gap-1.5">
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
        className="rounded border px-3 py-2 text-sm"
      >
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={loading || idiomas.length === 0}
        className="self-start rounded bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send invite"}
      </button>
    </form>
  );
}
