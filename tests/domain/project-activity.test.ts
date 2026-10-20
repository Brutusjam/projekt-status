import { describe, expect, it } from "vitest";
import { sortProjectsByActivity } from "@/lib/domain/projects/queries";
import type { ProjectSummary } from "@/lib/domain/types";

function makeSummary(
  overrides: Partial<ProjectSummary> & Pick<ProjectSummary, "id" | "titel">,
): ProjectSummary {
  return {
    abteilung: "Bau",
    ansprechperson: "Test",
    status: "IN_UMSETZUNG",
    startdatum: new Date("2026-01-01T00:00:00.000Z"),
    naechsterTermin: null,
    naechsterTerminLabel: null,
    kurzbeschrieb: "Kurz",
    wirkung: "Wirkung",
    archiviert: false,
    letztesUpdate: null,
    ...overrides,
  };
}

describe("sortProjectsByActivity", () => {
  it("sortiert absteigend nach letztem Update", () => {
    const projects = [
      makeSummary({
        id: 1,
        titel: "Alt",
        letztesUpdate: {
          datum: new Date("2026-01-01T12:00:00.000Z"),
          kurztitel: "U1",
        },
      }),
      makeSummary({
        id: 2,
        titel: "Neu",
        letztesUpdate: {
          datum: new Date("2026-06-01T12:00:00.000Z"),
          kurztitel: "U2",
        },
      }),
      makeSummary({
        id: 3,
        titel: "Mittel",
        letztesUpdate: {
          datum: new Date("2026-03-01T12:00:00.000Z"),
          kurztitel: "U3",
        },
      }),
    ];

    expect(sortProjectsByActivity(projects).map((p) => p.id)).toEqual([
      2, 3, 1,
    ]);
  });

  it("stellt Projekte ohne Update ans Ende", () => {
    const projects = [
      makeSummary({ id: 1, titel: "Ohne Update" }),
      makeSummary({
        id: 2,
        titel: "Mit Update",
        letztesUpdate: {
          datum: new Date("2026-05-01T12:00:00.000Z"),
          kurztitel: "U",
        },
      }),
      makeSummary({ id: 3, titel: "Auch ohne" }),
    ];

    expect(sortProjectsByActivity(projects).map((p) => p.id)).toEqual([
      2, 3, 1,
    ]);
  });

  it("sortiert bei gleichem Update-Datum alphabetisch nach Titel", () => {
    const sameDate = new Date("2026-05-01T12:00:00.000Z");
    const projects = [
      makeSummary({
        id: 1,
        titel: "Zebra",
        letztesUpdate: { datum: sameDate, kurztitel: "Z" },
      }),
      makeSummary({
        id: 2,
        titel: "Alpha",
        letztesUpdate: { datum: sameDate, kurztitel: "A" },
      }),
    ];

    expect(sortProjectsByActivity(projects).map((p) => p.titel)).toEqual([
      "Alpha",
      "Zebra",
    ]);
  });
});
