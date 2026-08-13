import { DateTime } from "luxon";
import { idiomaLabels } from "@/lib/labels";

export type PastClassForClient = {
  id: string;
  idioma: string;
  inicioUtc: string;
  withLabel: string;
  grabacionEstado: "NO_DISPONIBLE" | "PROCESANDO" | "DISPONIBLE" | "ELIMINADA";
  grabacionUrl: string | null;
};

export function PastClassesList({ classes }: { classes: PastClassForClient[] }) {
  if (classes.length === 0) {
    return <p className="text-sm text-neutral-600">No past classes yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {classes.map((c) => {
        const start = DateTime.fromISO(c.inicioUtc).toLocal();

        return (
          <div
            key={c.id}
            className="flex items-center justify-between rounded border px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            <div>
              <p className="text-sm font-medium">
                {idiomaLabels[c.idioma]} — {start.toFormat("EEE dd LLL, HH:mm")}
              </p>
              <p className="text-xs text-neutral-600">{c.withLabel}</p>
            </div>
            {c.grabacionEstado === "DISPONIBLE" && c.grabacionUrl && (
              <a
                href={c.grabacionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white transition-all hover:scale-[1.03] hover:bg-indigo-500 hover:shadow-md active:scale-95"
              >
                Watch recording
              </a>
            )}
            {c.grabacionEstado === "PROCESANDO" && (
              <span className="text-xs text-neutral-600">Recording processing…</span>
            )}
            {c.grabacionEstado === "ELIMINADA" && (
              <span className="text-xs text-neutral-600">Recording expired</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
