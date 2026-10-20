import { describe, expect, it } from "vitest";
import {
  getLatestUpdate,
  isUpdateStale,
  sortTimeline,
  STALE_UPDATE_DAYS,
} from "@/lib/domain/timeline";
import type { TimelineUpdate } from "@/lib/domain/types";

function makeUpdate(
  id: number,
  datum: string,
  createdAt: string,
): TimelineUpdate {
  return {
    id,
    projektId: 1,
    datum: new Date(datum),
    kurztitel: `Update ${id}`,
    detailtext: "Detail",
    status: "PUBLIZIERT",
    createdAt: new Date(createdAt),
    pdfDateiname: null,
    pdfMimeType: null,
    pdfGroesse: null,
    pdfGespeichertAm: null,
  };
}

describe("sortTimeline", () => {
  it("sortiert absteigend nach datum", () => {
    const updates = [
      makeUpdate(1, "2026-01-01T12:00:00.000Z", "2026-01-01T12:00:00.000Z"),
      makeUpdate(2, "2026-03-01T12:00:00.000Z", "2026-03-01T12:00:00.000Z"),
      makeUpdate(3, "2026-02-01T12:00:00.000Z", "2026-02-01T12:00:00.000Z"),
    ];

    const sorted = sortTimeline(updates);

    expect(sorted.map((update) => update.id)).toEqual([2, 3, 1]);
  });

  it("nutzt createdAt als Tiebreaker bei gleichem datum", () => {
    const updates = [
      makeUpdate(1, "2026-04-01T12:00:00.000Z", "2026-04-01T10:00:00.000Z"),
      makeUpdate(2, "2026-04-01T12:00:00.000Z", "2026-04-01T14:00:00.000Z"),
    ];

    const sorted = sortTimeline(updates);

    expect(sorted.map((update) => update.id)).toEqual([2, 1]);
    expect(getLatestUpdate(updates)?.id).toBe(2);
  });
});

describe("isUpdateStale", () => {
  const now = new Date("2026-07-15T12:00:00.000Z");

  it("ist stale ohne Update", () => {
    expect(isUpdateStale(null, now)).toBe(true);
  });

  it("ist nicht stale unter der Schwelle", () => {
    const recent = new Date("2026-06-01T12:00:00.000Z");
    expect(isUpdateStale(recent, now)).toBe(false);
  });

  it("ist stale über der Schwelle", () => {
    const old = new Date("2026-04-01T12:00:00.000Z");
    expect(isUpdateStale(old, now)).toBe(true);
  });

  it("ist genau an der Schwelle noch frisch", () => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const atThreshold = new Date(
      now.getTime() - STALE_UPDATE_DAYS * msPerDay,
    );
    expect(isUpdateStale(atThreshold, now)).toBe(false);

    const justOver = new Date(atThreshold.getTime() - 1);
    expect(isUpdateStale(justOver, now)).toBe(true);
  });
});
