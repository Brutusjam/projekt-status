import { describe, expect, it } from "vitest";
import {
  buildRechenschaftsbericht,
  parseReportDate,
  type ReportProjectInput,
  type ReportUpdateInput,
} from "@/lib/domain/report/rechenschaftsbericht";

const NOW = new Date("2026-10-21T10:00:00.000Z");

let nextId = 1;

function makeUpdate(
  datum: string,
  status: ReportUpdateInput["status"] = "PUBLIZIERT",
  createdAt = datum,
): ReportUpdateInput {
  const id = nextId++;
  return {
    id,
    datum: new Date(`${datum}T12:00:00.000Z`),
    kurztitel: `Update ${id}`,
    detailtext: "Detail",
    status,
    createdAt: new Date(`${createdAt}T12:00:00.000Z`),
    pdfDateiname: null,
  };
}

function makeProject(
  overrides: Partial<ReportProjectInput> & { titel: string },
): ReportProjectInput {
  return {
    id: nextId++,
    abteilung: "Kanzlei",
    ansprechperson: "GS",
    status: "IN_UMSETZUNG",
    startdatum: new Date("2026-01-15T12:00:00.000Z"),
    naechsterTermin: null,
    naechsterTerminLabel: null,
    kurzbeschrieb: "Beschrieb",
    wirkung: "Wirkung",
    archiviert: false,
    updates: [],
    ...overrides,
  };
}

const period = {
  von: parseReportDate("2026-01-01"),
  bis: parseReportDate("2026-10-21")!,
};

describe("parseReportDate", () => {
  it("liest JJJJ-MM-TT als UTC-Tag", () => {
    expect(parseReportDate("2026-03-05")?.toISOString()).toBe(
      "2026-03-05T00:00:00.000Z",
    );
  });

  it("gibt null für leere oder ungültige Werte zurück", () => {
    expect(parseReportDate("")).toBeNull();
    expect(parseReportDate(null)).toBeNull();
    expect(parseReportDate("05.03.2026")).toBeNull();
  });
});

describe("buildRechenschaftsbericht", () => {
  it("führt nur publizierte Updates im Zeitraum auf, neueste zuerst", () => {
    const project = makeProject({
      titel: "A",
      updates: [
        makeUpdate("2026-02-01"),
        makeUpdate("2026-09-01"),
        makeUpdate("2026-05-01", "ENTWURF"),
        makeUpdate("2025-12-01"),
        makeUpdate("2026-06-01"),
      ],
    });

    const report = buildRechenschaftsbericht([project], period, NOW);
    const [result] = report.projects;

    expect(result.updates.map((u) => u.datum.toISOString().slice(0, 10))).toEqual([
      "2026-09-01",
      "2026-06-01",
      "2026-02-01",
    ]);
    expect(result.updatesTotal).toBe(4);
    expect(result.letztesUpdate?.toISOString().slice(0, 10)).toBe("2026-09-01");
    expect(report.metrics.updatesImZeitraum).toBe(3);
    expect(report.metrics.updatesTotal).toBe(4);
  });

  it("nimmt das Enddatum inklusiv und ohne Beginn alle Updates", () => {
    const project = makeProject({
      titel: "A",
      updates: [makeUpdate("2026-10-21"), makeUpdate("2024-01-01")],
    });

    const report = buildRechenschaftsbericht(
      [project],
      { von: null, bis: period.bis },
      NOW,
    );

    expect(report.projects[0].updates).toHaveLength(2);
  });

  it("berechnet Status- und Abteilungskennzahlen", () => {
    const report = buildRechenschaftsbericht(
      [
        makeProject({ titel: "C", status: "ABGESCHLOSSEN", abteilung: "Bau" }),
        makeProject({ titel: "A", status: "IN_UMSETZUNG" }),
        makeProject({ titel: "B", status: "PILOTBETRIEB", abteilung: "Bau" }),
        makeProject({ titel: "D", status: "IDEE" }),
        makeProject({ titel: "E", status: "IN_ABKLAERUNG", abteilung: "Bau" }),
      ],
      period,
      NOW,
    );

    expect(report.projects.map((p) => p.titel)).toEqual(["A", "B", "C", "D", "E"]);
    expect(report.metrics.projekteTotal).toBe(5);
    expect(report.metrics.projekteLaufend).toBe(3);
    expect(report.metrics.projekteAbgeschlossen).toBe(1);
    expect(report.metrics.abteilungen).toEqual([
      { abteilung: "Bau", anzahl: 3 },
      { abteilung: "Kanzlei", anzahl: 2 },
    ]);
    expect(
      report.metrics.statusVerteilung.find((s) => s.status === "IDEE")?.anzahl,
    ).toBe(1);
  });

  it("markiert laufende Projekte ohne aktuelles Update, nicht aber abgeschlossene", () => {
    const report = buildRechenschaftsbericht(
      [
        makeProject({ titel: "Alt", updates: [makeUpdate("2026-05-01")] }),
        makeProject({ titel: "Frisch", updates: [makeUpdate("2026-10-01")] }),
        makeProject({ titel: "Fertig", status: "ABGESCHLOSSEN" }),
      ],
      period,
      NOW,
    );

    expect(report.projects.filter((p) => p.veraltet).map((p) => p.titel)).toEqual([
      "Alt",
    ]);
    expect(report.metrics.projekteVeraltet).toBe(1);
    expect(report.metrics.projekteMitUpdateImZeitraum).toBe(2);
  });

  it("zählt Updates pro Monat über die letzten 12 Monate", () => {
    const report = buildRechenschaftsbericht(
      [
        makeProject({
          titel: "A",
          updates: [
            makeUpdate("2026-10-02"),
            makeUpdate("2026-10-15"),
            makeUpdate("2026-03-01"),
          ],
        }),
      ],
      { von: null, bis: period.bis },
      NOW,
    );

    const months = report.metrics.updatesProMonat;
    expect(months).toHaveLength(12);
    expect(months[0].monat).toBe("2025-11");
    expect(months.at(-1)).toEqual({ monat: "2026-10", anzahl: 2 });
    expect(months.find((m) => m.monat === "2026-03")?.anzahl).toBe(1);
  });

  it("listet anstehende Termine chronologisch", () => {
    const report = buildRechenschaftsbericht(
      [
        makeProject({ titel: "Spät", naechsterTermin: new Date("2026-12-01T12:00:00.000Z") }),
        makeProject({ titel: "Vorbei", naechsterTermin: new Date("2026-09-01T12:00:00.000Z") }),
        makeProject({ titel: "Bald", naechsterTermin: new Date("2026-11-01T12:00:00.000Z") }),
      ],
      period,
      NOW,
    );

    expect(report.metrics.naechsteTermine.map((t) => t.titel)).toEqual(["Bald", "Spät"]);
  });
});
