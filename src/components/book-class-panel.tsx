"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";
import { idiomaLabels } from "@/lib/labels";

type Slot = {
  id: string;
  idioma: string;
  inicioUtc: string;
  finUtc: string;
  capacidadMax: number;
  bookings: unknown[];
  teacher: { user: { nombre: string } };
};

export function BookClassPanel() {
  const router = useRouter();
  const [idioma, setIdioma] = useState("INGLES");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      setLoading(true);
      try {
        const res = await fetch(`/api/availability?idioma=${idioma}`);
        const data = await res.json();
        if (!cancelled) setSlots(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, [idioma]);

  async function handleBook(slotId: string) {
    setBookingId(slotId);
    setMessage(null);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId }),
    });
    const data = await res.json();
    setBookingId(null);

    if (!res.ok) {
      setMessage(data.error ?? "Could not book this class");
      return;
    }

    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    setMessage("Class booked!");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <select
        value={idioma}
        onChange={(e) => setIdioma(e.target.value)}
        className="w-fit rounded border px-3 py-2"
      >
        {Object.entries(idiomaLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {message && <p className="text-sm text-indigo-700">{message}</p>}
      {loading && <p className="text-sm text-neutral-600">Loading...</p>}
      {!loading && slots.length === 0 && (
        <p className="text-sm text-neutral-600">
          No open slots for this language right now.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {slots.map((slot) => {
          const start = DateTime.fromISO(slot.inicioUtc).toLocal();
          const end = DateTime.fromISO(slot.finUtc).toLocal();
          const spotsLeft = slot.capacidadMax - slot.bookings.length;

          return (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  {start.toFormat("EEE dd LLL, HH:mm")}–{end.toFormat("HH:mm")}
                </p>
                <p className="text-xs text-neutral-600">
                  {slot.teacher.user.nombre} · {spotsLeft} spot
                  {spotsLeft === 1 ? "" : "s"} left
                </p>
              </div>
              <button
                onClick={() => handleBook(slot.id)}
                disabled={bookingId === slot.id}
                className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {bookingId === slot.id ? "Booking..." : "Book"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
