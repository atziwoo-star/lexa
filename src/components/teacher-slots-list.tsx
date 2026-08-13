"use client";

import Link from "next/link";
import { DateTime } from "luxon";
import { idiomaLabels } from "@/lib/labels";
import { isClassJoinable } from "@/lib/class-join-window";

export type TeacherSlotForClient = {
  id: string;
  idioma: string;
  inicioUtc: string;
  finUtc: string;
  capacidadMax: number;
  studentNames: string[];
};

export function TeacherSlotsList({ slots }: { slots: TeacherSlotForClient[] }) {
  if (slots.length === 0) {
    return <p className="text-sm text-neutral-600">No upcoming classes yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {slots.map((slot) => {
        const start = DateTime.fromISO(slot.inicioUtc).toLocal();
        const end = DateTime.fromISO(slot.finUtc).toLocal();
        const joinable = isClassJoinable(slot.inicioUtc, slot.finUtc);

        return (
          <div
            key={slot.id}
            className="flex items-center justify-between rounded border px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">
                {idiomaLabels[slot.idioma]} — {start.toFormat("EEE dd LLL, HH:mm")}–
                {end.toFormat("HH:mm")}
              </p>
              <p className="text-xs text-neutral-600">
                {slot.studentNames.length}/{slot.capacidadMax} booked
                {slot.studentNames.length > 0 && `: ${slot.studentNames.join(", ")}`}
              </p>
            </div>
            {joinable && (
              <Link
                href={`/class/${slot.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white"
              >
                Join class
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
