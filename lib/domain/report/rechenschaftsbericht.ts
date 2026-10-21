import type { ProjektStatus, UpdateStatus } from "@/app/generated/prisma/client";
import { isUpdateStale, sortTimeline } from "@/lib/domain/timeline";
import { filterPublished } from "@/lib/domain/visibility";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Anzahl Monate im Diagramm «Updates pro Monat». */
export const REPORT_MONTH_COUNT = 12;

/** Status, die als «laufend» gelten. */
const LAUFEND: ProjektStatus[] = ["IN_ABKLAERUNG", "IN_UMSETZUNG", "PILOTBETRIEB"];

export const STATUS_ORDER: ProjektStatus[] = [
  "IDEE",
  "IN_ABKLAERUNG",
  "IN_UMSETZUNG",
  "PILOTBETRIEB",
  "ABGESCHLOSSEN",
  "PAUSIERT",
];

export type ReportUpdateInput = {
  id: number;
  datum: Date;
  kurztitel: string;
  detailtext: string;
  status: UpdateStatus;
  createdAt: Date;
  pdfDateiname: string | null;
};

export type ReportProjectInput = {
  id: number;
  titel: string;
  abteilung: string;
  ansprechperson: string;
  status: ProjektStatus;
  startdatum: Date;
  naechsterTermin: Date | null;
  naechsterTerminLabel: string | null;
  kurzbeschrieb: string;
  wirkung: string;
  archiviert: boolean;
  updates: ReportUpdateInput[];
};

export type ReportPeriod = {
  /** Beginn inklusiv; null = seit Beginn. */
  von: Date | null;
  /** Ende inklusiv (bis Ende des Tages). */
  bis: Date;
};

export type ReportProject = Omit<ReportProjectInput, "updates"> & {
  /** Publizierte Updates im Berichtszeitraum, neueste zuerst (R3). */
  updates: ReportUpdateInput[];
  updatesTotal: number;
  letztesUpdate: Date | null;
  laufzeitTage: number;
  veraltet: boolean;
};

export type ReportMetrics = {
  projekteTotal: number;
  projekteLaufend: number;
  projekteAbgeschlossen: number;
  projekteVeraltet: number;
  projekteMitUpdateImZeitraum: number;
  projekteNeuImZeitraum: number;
  updatesImZeitraum: number;
  updatesTotal: number;
  durchschnittLaufzeitTage: number;
  statusVerteilung: Array<{ status: ProjektStatus; anzahl: number }>;
  abteilungen: Array<{ abteilung: string; anzahl: number }>;
  updatesProMonat: Array<{ monat: string; anzahl: number }>;
  naechsteTermine: Array<{
    projektId: number;
    titel: string;
    datum: Date;
    label: string | null;
  }>;
};

export type Rechenschaftsbericht = {
  period: ReportPeriod;
  erstelltAm: Date;
  metrics: ReportMetrics;
  projects: ReportProject[];
};

/** Liest ein Datum im Format JJJJ-MM-TT als UTC-Tag; leer oder ungültig ergibt null. */
export function parseReportDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function endOfUtcDay(date: Date): Date {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function isInPeriod(date: Date, period: ReportPeriod): boolean {
  if (period.von && date.getTime() < period.von.getTime()) {
    return false;
  }
  return date.getTime() <= endOfUtcDay(period.bis).getTime();
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Die letzten {@link REPORT_MONTH_COUNT} Monate bis und mit dem Monat von `bis`. */
function lastMonths(bis: Date): string[] {
  const months: string[] = [];
  for (let offset = REPORT_MONTH_COUNT - 1; offset >= 0; offset -= 1) {
    const month = new Date(
      Date.UTC(bis.getUTCFullYear(), bis.getUTCMonth() - offset, 1),
    );
    months.push(monthKey(month));
  }
  return months;
}

export function buildRechenschaftsbericht(
  input: ReportProjectInput[],
  period: ReportPeriod,
  now: Date = new Date(),
): Rechenschaftsbericht {
  const stichtag = endOfUtcDay(period.bis).getTime() < now.getTime()
    ? endOfUtcDay(period.bis)
    : now;

  const projects: ReportProject[] = input
    .map((project) => {
      const published = sortTimeline(filterPublished(project.updates));
      const letztesUpdate = published[0]?.datum ?? null;
      return {
        ...project,
        updates: published.filter((update) => isInPeriod(update.datum, period)),
        updatesTotal: published.length,
        letztesUpdate,
        laufzeitTage: Math.max(
          0,
          Math.floor((stichtag.getTime() - project.startdatum.getTime()) / MS_PER_DAY),
        ),
        veraltet:
          project.status !== "ABGESCHLOSSEN" &&
          project.status !== "PAUSIERT" &&
          isUpdateStale(letztesUpdate, stichtag),
      };
    })
    .sort((a, b) => a.titel.localeCompare(b.titel, "de-CH"));

  const statusVerteilung = STATUS_ORDER.map((status) => ({
    status,
    anzahl: projects.filter((project) => project.status === status).length,
  }));

  const abteilungCounts = new Map<string, number>();
  for (const project of projects) {
    abteilungCounts.set(project.abteilung, (abteilungCounts.get(project.abteilung) ?? 0) + 1);
  }
  const abteilungen = [...abteilungCounts.entries()]
    .map(([abteilung, anzahl]) => ({ abteilung, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl || a.abteilung.localeCompare(b.abteilung, "de-CH"));

  const allPublished = input.flatMap((project) => filterPublished(project.updates));
  const monthCounts = new Map(lastMonths(period.bis).map((month) => [month, 0]));
  for (const update of allPublished) {
    const key = monthKey(update.datum);
    if (monthCounts.has(key) && isInPeriod(update.datum, period)) {
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
  }

  const naechsteTermine = projects
    .filter(
      (project): project is ReportProject & { naechsterTermin: Date } =>
        project.naechsterTermin !== null &&
        project.naechsterTermin.getTime() >= period.bis.getTime(),
    )
    .map((project) => ({
      projektId: project.id,
      titel: project.titel,
      datum: project.naechsterTermin,
      label: project.naechsterTerminLabel,
    }))
    .sort((a, b) => a.datum.getTime() - b.datum.getTime());

  const laufzeitSumme = projects.reduce((sum, project) => sum + project.laufzeitTage, 0);

  return {
    period,
    erstelltAm: now,
    projects,
    metrics: {
      projekteTotal: projects.length,
      projekteLaufend: projects.filter((p) => LAUFEND.includes(p.status)).length,
      projekteAbgeschlossen: projects.filter((p) => p.status === "ABGESCHLOSSEN").length,
      projekteVeraltet: projects.filter((p) => p.veraltet).length,
      projekteMitUpdateImZeitraum: projects.filter((p) => p.updates.length > 0).length,
      projekteNeuImZeitraum: projects.filter((p) => isInPeriod(p.startdatum, period)).length,
      updatesImZeitraum: projects.reduce((sum, p) => sum + p.updates.length, 0),
      updatesTotal: allPublished.length,
      durchschnittLaufzeitTage:
        projects.length === 0 ? 0 : Math.round(laufzeitSumme / projects.length),
      statusVerteilung,
      abteilungen,
      updatesProMonat: [...monthCounts.entries()].map(([monat, anzahl]) => ({
        monat,
        anzahl,
      })),
      naechsteTermine,
    },
  };
}
