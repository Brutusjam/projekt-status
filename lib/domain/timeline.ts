import type { TimelineUpdate } from "@/lib/domain/types";

/** Tage ohne publiziertes Update, ab denen ein Frische-Hinweis angezeigt wird. */
export const STALE_UPDATE_DAYS = 60;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type Sortable = Pick<TimelineUpdate, "datum" | "createdAt">;

export function sortTimeline<T extends Sortable>(updates: T[]): T[] {
  return [...updates].sort((a, b) => {
    const dateDiff = b.datum.getTime() - a.datum.getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function getLatestUpdate<T extends Sortable>(
  updates: T[],
): T | null {
  const sorted = sortTimeline(updates);
  return sorted[0] ?? null;
}

/**
 * True, wenn kein Update vorliegt oder das letzte Update älter als
 * {@link STALE_UPDATE_DAYS} Tage ist (bezogen auf `now`).
 */
export function isUpdateStale(
  lastUpdateDate: Date | null,
  now: Date = new Date(),
): boolean {
  if (!lastUpdateDate) {
    return true;
  }

  const ageMs = now.getTime() - lastUpdateDate.getTime();
  return ageMs > STALE_UPDATE_DAYS * MS_PER_DAY;
}
