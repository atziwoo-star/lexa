import { DateTime } from "luxon";

// Class rooms open 10 minutes before start and stay open until 15 minutes
// after the scheduled end, to allow for early joins and slightly-long classes.
export const JOIN_WINDOW_BEFORE_MINUTES = 10;
export const JOIN_WINDOW_AFTER_MINUTES = 15;

export function isClassJoinable(inicioUtc: string | Date, finUtc: string | Date) {
  const now = DateTime.now();
  const opensAt = DateTime.fromISO(
    inicioUtc instanceof Date ? inicioUtc.toISOString() : inicioUtc,
  ).minus({ minutes: JOIN_WINDOW_BEFORE_MINUTES });
  const closesAt = DateTime.fromISO(
    finUtc instanceof Date ? finUtc.toISOString() : finUtc,
  ).plus({ minutes: JOIN_WINDOW_AFTER_MINUTES });

  return now >= opensAt && now <= closesAt;
}
