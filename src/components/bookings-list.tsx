"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DateTime } from "luxon";
import { idiomaLabels } from "@/lib/labels";
import { isClassJoinable } from "@/lib/class-join-window";

export type BookingForClient = {
  id: string;
  slotId: string;
  idioma: string;
  inicioUtc: string;
  finUtc: string;
  fechaLimiteCancelacion: string;
  teacherName: string;
};

export function BookingsList({
  initialBookings,
}: {
  initialBookings: BookingForClient[];
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCancel(id: string) {
    setCancellingId(id);
    setMessage(null);

    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    const data = await res.json();
    setCancellingId(null);

    if (!res.ok) {
      setMessage(data.error ?? "Could not cancel this booking");
      return;
    }

    setBookings((prev) => prev.filter((b) => b.id !== id));
    setMessage(
      data.refunded
        ? "Class cancelled — your hour was refunded."
        : "Class cancelled. Since it was within 24h of the class, the hour was not refunded.",
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {message && <p className="text-sm text-indigo-700">{message}</p>}

      {bookings.length === 0 ? (
        <p className="text-sm text-neutral-600">No upcoming classes.</p>
      ) : (
        bookings.map((booking) => {
          const start = DateTime.fromISO(booking.inicioUtc).toLocal();
          const end = DateTime.fromISO(booking.finUtc).toLocal();
          const joinable = isClassJoinable(booking.inicioUtc, booking.finUtc);

          return (
            <div
              key={booking.id}
              className="flex items-center justify-between rounded border px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <div>
                <p className="text-sm font-medium">
                  {idiomaLabels[booking.idioma]} — {start.toFormat("EEE dd LLL, HH:mm")}–
                  {end.toFormat("HH:mm")}
                </p>
                <p className="text-xs text-neutral-600">
                  with {booking.teacherName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {joinable && (
                  <Link
                    href={`/class/${booking.slotId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white transition-all hover:scale-[1.03] hover:bg-indigo-500 hover:shadow-md active:scale-95"
                  >
                    Join class
                  </Link>
                )}
                <button
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancellingId === booking.id}
                  className="rounded border px-3 py-1.5 text-sm transition-all hover:scale-[1.03] hover:bg-neutral-50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 dark:hover:bg-neutral-900"
                >
                  {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
