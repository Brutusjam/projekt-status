import type { ProjektStatus } from "@/app/generated/prisma/client";
import type {
  Rechenschaftsbericht,
  ReportProject,
} from "@/lib/domain/report/rechenschaftsbericht";
import { STALE_UPDATE_DAYS } from "@/lib/domain/timeline";
import { formatDate } from "@/lib/format";
import { getProjektStatusLabel } from "@/lib/labels";
import { escapeHtml, markdownToHtml } from "@/lib/pdf/templates";

const MONTH_LABELS = [
  "Jan", "Feb", "März", "Apr", "Mai", "Juni",
  "Juli", "Aug", "Sep", "Okt", "Nov", "Dez",
];

/** Statusfarben wie in globals.css (Fläche, Schrift). */
const STATUS_COLORS: Record<ProjektStatus, { bg: string; fg: string }> = {
  IDEE: { bg: "oklch(0.88 0.01 260)", fg: "oklch(0.35 0.02 260)" },
  IN_ABKLAERUNG: { bg: "oklch(0.88 0.06 250)", fg: "oklch(0.32 0.08 250)" },
  IN_UMSETZUNG: { bg: "oklch(0.9 0.08 85)", fg: "oklch(0.38 0.1 75)" },
  PILOTBETRIEB: { bg: "oklch(0.88 0.08 300)", fg: "oklch(0.34 0.1 300)" },
  ABGESCHLOSSEN: { bg: "oklch(0.9 0.06 145)", fg: "oklch(0.32 0.08 145)" },
  PAUSIERT: { bg: "oklch(0.95 0.005 106)", fg: "oklch(0.45 0.02 260)" },
};

const REPORT_STYLES = `
:root {
  --ad-ink: #1a1a1a;
  --ad-ink-soft: #555555;
  --ad-ink-muted: #8a8a8a;
  --ad-rule: #1a1a1a;
  --ad-rule-soft: #d9d9d9;
  --ad-surface: #f5f5f3;
  --ad-bg: #ffffff;
  --ad-accent: #b5121b;
  --ad-chart: #3d4a5c;
  --ad-font-head: 'Space Grotesk', system-ui, sans-serif;
  --ad-font-body: 'Inter', system-ui, sans-serif;
  --ad-fs-body: 12.5px;
  --ad-header-logo-h: 44px;
  --ad-header-gap: 24px;
  --ad-rule-w: 1.5px;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--ad-font-body);
  font-size: var(--ad-fs-body);
  line-height: 1.5;
  color: var(--ad-ink);
  background: var(--ad-bg);
}
/* Seitenränder oben/unten setzt die PDF-Ausgabe (A4), seitlich das Sheet. */
.sheet { padding: 0 48px; }
.kpi, .grid-2, .legend__item, .termine li, .overview tr, .facts, .textblock, .entry, .empty, .notes {
  break-inside: avoid;
}
.section-title, h2, h3 { break-after: avoid; }

.ad-doc-header__top {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 24px; margin-bottom: var(--ad-header-gap);
}
.ad-doc-header__context { font-weight: 700; font-size: 12.5px; }
.ad-doc-header__logo { height: var(--ad-header-logo-h); width: auto; }
.ad-doc-header__rule {
  border: none; border-top: var(--ad-rule-w) solid var(--ad-rule); margin: 0 0 20px 0;
}
.ad-doc-header__meta {
  display: flex; justify-content: space-between; gap: 24px; margin-bottom: 40px;
}
.ad-doc-header__address { font-style: normal; color: var(--ad-ink-soft); line-height: 1.5; }
.ad-doc-header__docinfo { text-align: right; font-weight: 700; line-height: 1.5; }

.eyebrow {
  font-family: var(--ad-font-head); font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.08em; color: var(--ad-ink-soft);
}
h1, h2, h3 { font-family: var(--ad-font-head); margin: 0; }
h1 { font-size: 28px; line-height: 1.15; margin: 6px 0 10px; }
h2 { font-size: 20px; line-height: 1.2; }
h3 { font-size: 14px; }
.lead { color: var(--ad-ink-soft); font-size: 13.5px; max-width: 560px; }
.muted { color: var(--ad-ink-soft); }
.num { font-variant-numeric: tabular-nums; }

.section { margin-top: 36px; }
.section--newpage { break-before: page; margin-top: 0; }
.section-title {
  display: flex; align-items: baseline; justify-content: space-between;
  border-bottom: 1px solid var(--ad-rule-soft); padding-bottom: 6px; margin-bottom: 14px;
}

.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.kpi {
  background: var(--ad-surface); border-radius: 10px; padding: 14px 14px 12px;
}
.kpi--dark { background: var(--ad-ink); color: #fff; }
.kpi--dark .kpi__label, .kpi--dark .kpi__hint { color: #c9c9c9; }
.kpi__label { font-size: 11px; color: var(--ad-ink-soft); }
.kpi__value {
  font-family: var(--ad-font-head); font-size: 30px; font-weight: 700;
  line-height: 1.1; margin: 4px 0 2px; font-variant-numeric: tabular-nums;
}
.kpi__hint { font-size: 10.5px; color: var(--ad-ink-muted); }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }

.stack {
  display: flex; gap: 2px; height: 22px; border-radius: 4px; overflow: hidden; margin: 4px 0 12px;
}
.stack__seg { height: 100%; }
.legend { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
.legend__item { display: flex; align-items: center; gap: 8px; }
.legend__swatch {
  width: 10px; height: 10px; border-radius: 3px; flex: none;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
}
.legend__count { margin-left: auto; font-weight: 600; }

.columns {
  display: flex; align-items: flex-end; gap: 6px; height: 130px;
  border-bottom: 1px solid var(--ad-ink-muted); padding-top: 16px;
}
.columns__col {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: flex-end; height: 100%;
}
.columns__bar { width: 100%; max-width: 22px; background: var(--ad-chart); border-radius: 4px 4px 0 0; }
.columns__value { font-size: 10px; color: var(--ad-ink-soft); margin-bottom: 3px; }
.columns__labels { display: flex; gap: 6px; margin-top: 4px; }
.columns__labels span { flex: 1; text-align: center; font-size: 9.5px; color: var(--ad-ink-soft); }

.bars { display: grid; grid-template-columns: auto 1fr auto; gap: 7px 10px; align-items: center; }
.bars__track { height: 10px; }
.bars__bar { height: 100%; background: var(--ad-chart); border-radius: 0 4px 4px 0; min-width: 2px; }

.termine { list-style: none; margin: 0; padding: 0; }
.termine li {
  display: grid; grid-template-columns: 82px 1fr; gap: 10px;
  padding: 7px 0; border-bottom: 1px solid var(--ad-rule-soft);
}
.termine li:last-child { border-bottom: none; }

table.overview { width: 100%; border-collapse: collapse; }
.overview th, .overview td {
  text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--ad-rule-soft); vertical-align: top;
}
.overview th { font-size: 11px; font-weight: 600; color: var(--ad-ink-soft); }
.overview td.r, .overview th.r { text-align: right; }

.badge {
  display: inline-block; border-radius: 999px; padding: 2px 9px;
  font-size: 10.5px; font-weight: 600; white-space: nowrap;
}
.flag { color: var(--ad-accent); font-weight: 600; }

.notes { margin-top: 18px; font-size: 10.5px; color: var(--ad-ink-soft); }
.notes p { margin: 2px 0; }

.project { break-before: page; padding-top: 22px; border-top: 3px solid var(--ad-ink); }
.project__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.project__head h2 { margin-top: 4px; }
.facts {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 16px;
  margin: 18px 0 20px; padding: 14px 16px; background: var(--ad-surface); border-radius: 10px;
}
.facts dt { font-size: 10.5px; color: var(--ad-ink-soft); }
.facts dd { margin: 1px 0 0; font-weight: 600; }
.texts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.textblock h3 { margin-bottom: 6px; }
.textblock--dark { background: var(--ad-ink); color: #fff; border-radius: 10px; padding: 14px 16px; }
.textblock--dark .eyebrow { color: #c9c9c9; }
.textblock .eyebrow { margin-bottom: 6px; }
.md p { margin: 0 0 6px 0; }
.md p:last-child { margin-bottom: 0; }
.md ul, .md ol { margin: 0 0 6px 0; padding-left: 18px; }
.md li { margin: 2px 0; }

.timeline { margin-top: 22px; }
.timeline__list { margin-top: 10px; }
.entry { display: grid; grid-template-columns: 86px 14px 1fr; gap: 0 10px; }
.entry__date { font-weight: 600; font-size: 11.5px; padding-top: 1px; }
.entry__rail { position: relative; }
.entry__rail::before {
  content: ""; position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: var(--ad-rule-soft);
}
.entry:first-child .entry__rail::before { top: 6px; }
.entry:last-child .entry__rail::before { bottom: auto; height: 6px; }
.entry__dot {
  position: absolute; left: 2px; top: 4px; width: 10px; height: 10px; border-radius: 50%;
  background: var(--ad-bg); border: 2px solid var(--ad-chart);
}
.entry:first-child .entry__dot { background: var(--ad-chart); }
.entry__body { padding-bottom: 16px; }
.entry__title { font-weight: 700; margin-bottom: 3px; }
.entry__attachment { font-size: 10.5px; color: var(--ad-ink-soft); margin-top: 4px; }
.empty {
  border: 1px dashed var(--ad-rule-soft); border-radius: 10px; padding: 12px 14px; color: var(--ad-ink-soft);
}

`;

const numberFormat = new Intl.NumberFormat("de-CH");

function n(value: number): string {
  return numberFormat.format(value);
}

function formatLaufzeit(days: number): string {
  if (days < 60) {
    return days === 1 ? "1 Tag" : `${n(days)} Tage`;
  }
  const months = Math.round(days / 30.44);
  if (months < 24) {
    return `${n(months)} Monate`;
  }
  return `${(days / 365.25).toLocaleString("de-CH", { maximumFractionDigits: 1 })} Jahre`;
}

function formatMonth(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_LABELS[month - 1]}${month === 1 ? ` ${String(year).slice(2)}` : ""}`;
}

function periodLabel(report: Rechenschaftsbericht): string {
  const bis = formatDate(report.period.bis);
  return report.period.von ? `${formatDate(report.period.von)} bis ${bis}` : `bis ${bis}`;
}

function statusBadge(status: ProjektStatus): string {
  const { bg, fg } = STATUS_COLORS[status];
  const border = status === "PAUSIERT" ? "box-shadow: inset 0 0 0 1px var(--ad-rule-soft);" : "";
  return `<span class="badge" style="background:${bg};color:${fg};${border}">${escapeHtml(getProjektStatusLabel(status))}</span>`;
}

function kpi(label: string, value: string, hint: string, dark = false): string {
  return `
    <div class="kpi${dark ? " kpi--dark" : ""}">
      <div class="kpi__label">${label}</div>
      <div class="kpi__value">${value}</div>
      <div class="kpi__hint">${hint}</div>
    </div>`;
}

function docHeader(docinfo: string, logoSrc: string): string {
  return `
<header class="ad-doc-header">
  <div class="ad-doc-header__top">
    <div class="ad-doc-header__context">Prozess &amp; Digital</div>
    <img class="ad-doc-header__logo" src="${logoSrc}" alt="Gemeinde Altdorf">
  </div>
  <hr class="ad-doc-header__rule">
  <div class="ad-doc-header__meta">
    <address class="ad-doc-header__address">
      Tellsgasse 25<br>
      6460 Altdorf<br>
      Telefon 041 874 12 20
    </address>
    <div class="ad-doc-header__docinfo">${docinfo}</div>
  </div>
</header>`;
}

function renderDashboard(report: Rechenschaftsbericht): string {
  const m = report.metrics;
  const total = m.projekteTotal;

  const kpis = `
    <div class="kpis">
      ${kpi("Projekte im Bericht", n(total), `${n(m.projekteNeuImZeitraum)} neu gestartet im Zeitraum`, true)}
      ${kpi("Laufende Projekte", n(m.projekteLaufend), "Abklärung, Umsetzung, Pilot")}
      ${kpi("Abgeschlossen", n(m.projekteAbgeschlossen), total ? `${Math.round((m.projekteAbgeschlossen / total) * 100)}% des Portfolios` : "")}
      ${kpi("Updates im Zeitraum", n(m.updatesImZeitraum), `${n(m.updatesTotal)} publiziert insgesamt`)}
      ${kpi("Projekte mit Update", `${n(m.projekteMitUpdateImZeitraum)}<span class="muted" style="font-size:16px"> / ${n(total)}</span>`, "mindestens ein Update im Zeitraum")}
      ${kpi("Ohne aktuelles Update", n(m.projekteVeraltet), `kein Update seit ${STALE_UPDATE_DAYS} Tagen`)}
      ${kpi("Ø Laufzeit", formatLaufzeit(m.durchschnittLaufzeitTage), "seit Projektstart")}
      ${kpi("Anstehende Termine", n(m.naechsteTermine.length), "nach Ende Berichtszeitraum")}
    </div>`;

  const segments = m.statusVerteilung
    .filter((entry) => entry.anzahl > 0)
    .map((entry) => {
      const { bg } = STATUS_COLORS[entry.status];
      return `<div class="stack__seg" style="flex:${entry.anzahl};background:${bg}" title="${escapeHtml(getProjektStatusLabel(entry.status))}"></div>`;
    })
    .join("");
  const legend = m.statusVerteilung
    .map((entry) => {
      const { bg } = STATUS_COLORS[entry.status];
      return `<div class="legend__item"><span class="legend__swatch" style="background:${bg}"></span>${escapeHtml(getProjektStatusLabel(entry.status))}<span class="legend__count num">${n(entry.anzahl)}</span></div>`;
    })
    .join("");

  const maxMonth = Math.max(1, ...m.updatesProMonat.map((entry) => entry.anzahl));
  const columns = m.updatesProMonat
    .map(
      (entry) => `
        <div class="columns__col">
          ${entry.anzahl > 0 ? `<div class="columns__value num">${n(entry.anzahl)}</div>` : ""}
          <div class="columns__bar" style="height:${(entry.anzahl / maxMonth) * 100}%"></div>
        </div>`,
    )
    .join("");
  const columnLabels = m.updatesProMonat
    .map((entry) => `<span>${formatMonth(entry.monat)}</span>`)
    .join("");

  const maxAbteilung = Math.max(1, ...m.abteilungen.map((entry) => entry.anzahl));
  const abteilungen = m.abteilungen
    .map(
      (entry) => `
        <div>${escapeHtml(entry.abteilung)}</div>
        <div class="bars__track"><div class="bars__bar" style="width:${(entry.anzahl / maxAbteilung) * 100}%"></div></div>
        <div class="num" style="font-weight:600">${n(entry.anzahl)}</div>`,
    )
    .join("");

  const termine = m.naechsteTermine
    .slice(0, 8)
    .map(
      (termin) => `
        <li>
          <span class="num" style="font-weight:600">${formatDate(termin.datum)}</span>
          <span>${escapeHtml(termin.titel)}${termin.label ? `<br><span class="muted">${escapeHtml(termin.label)}</span>` : ""}</span>
        </li>`,
    )
    .join("");

  const rows = report.projects
    .map(
      (project) => `
        <tr>
          <td><strong>${escapeHtml(project.titel)}</strong>${project.archiviert ? ' <span class="muted">(archiviert)</span>' : ""}</td>
          <td>${escapeHtml(project.abteilung)}</td>
          <td>${statusBadge(project.status)}</td>
          <td class="num">${formatDate(project.startdatum)}</td>
          <td class="num">${project.letztesUpdate ? formatDate(project.letztesUpdate) : "keines"}${project.veraltet ? ' <span class="flag">●</span>' : ""}</td>
          <td class="r num">${n(project.updates.length)}</td>
        </tr>`,
    )
    .join("");

  return `
    <section class="section">
      <div class="section-title"><h3>Kennzahlen</h3><span class="muted">Berichtszeitraum ${periodLabel(report)}</span></div>
      ${kpis}
    </section>

    <section class="section grid-2">
      <div>
        <div class="section-title"><h3>Portfolio nach Status</h3><span class="muted num">${n(total)} Projekte</span></div>
        <div class="stack">${segments}</div>
        <div class="legend">${legend}</div>
      </div>
      <div>
        <div class="section-title"><h3>Publizierte Updates pro Monat</h3><span class="muted">letzte 12 Monate</span></div>
        <div class="columns">${columns}</div>
        <div class="columns__labels">${columnLabels}</div>
      </div>
    </section>

    <section class="section section--newpage grid-2">
      <div>
        <div class="section-title"><h3>Projekte nach Abteilung</h3></div>
        ${abteilungen ? `<div class="bars">${abteilungen}</div>` : '<p class="muted">Keine Projekte.</p>'}
      </div>
      <div>
        <div class="section-title"><h3>Nächste Termine</h3></div>
        ${termine ? `<ul class="termine">${termine}</ul>` : '<p class="muted">Keine anstehenden Termine erfasst.</p>'}
      </div>
    </section>

    <section class="section">
      <div class="section-title"><h3>Projektübersicht</h3><span class="muted">Steckbriefe und Updates folgen unten</span></div>
      <table class="overview">
        <thead>
          <tr>
            <th>Projekt</th>
            <th>Abteilung</th>
            <th>Status</th>
            <th>Start</th>
            <th>Letztes Update</th>
            <th class="r">Updates im Zeitraum</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="notes">
        <p><span class="flag">●</span> Ohne aktuelles Update: Projekt ist weder abgeschlossen noch pausiert und hat seit mehr als ${STALE_UPDATE_DAYS} Tagen kein publiziertes Update.</p>
        <p>Berücksichtigt werden ausschliesslich publizierte Updates. Entwürfe erscheinen nicht im Bericht.</p>
      </div>
    </section>`;
}

function renderProject(project: ReportProject, index: number, total: number): string {
  const termin = project.naechsterTermin
    ? `${formatDate(project.naechsterTermin)}${project.naechsterTerminLabel ? `<br><span class="muted" style="font-weight:400">${escapeHtml(project.naechsterTerminLabel)}</span>` : ""}`
    : "nicht festgelegt";

  const entries = project.updates
    .map(
      (update) => `
        <div class="entry">
          <div class="entry__date num">${formatDate(update.datum)}</div>
          <div class="entry__rail"><span class="entry__dot"></span></div>
          <div class="entry__body">
            <div class="entry__title">${escapeHtml(update.kurztitel)}</div>
            <div class="md">${markdownToHtml(update.detailtext)}</div>
            ${update.pdfDateiname ? `<div class="entry__attachment">Anhang: ${escapeHtml(update.pdfDateiname)}</div>` : ""}
          </div>
        </div>`,
    )
    .join("");

  return `
    <section class="project">
      <div class="project__head">
        <div>
          <div class="eyebrow">Projekt ${index + 1} von ${total} · ${escapeHtml(project.abteilung)}</div>
          <h2>${escapeHtml(project.titel)}</h2>
        </div>
        ${statusBadge(project.status)}
      </div>

      <dl class="facts">
        <div><dt>Abteilung</dt><dd>${escapeHtml(project.abteilung)}</dd></div>
        <div><dt>Ansprechperson</dt><dd>${escapeHtml(project.ansprechperson)}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(getProjektStatusLabel(project.status))}${project.archiviert ? " (archiviert)" : ""}</dd></div>
        <div><dt>Startdatum</dt><dd class="num">${formatDate(project.startdatum)}</dd></div>
        <div><dt>Laufzeit</dt><dd>${formatLaufzeit(project.laufzeitTage)}</dd></div>
        <div><dt>Nächster Termin</dt><dd class="num">${termin}</dd></div>
        <div><dt>Letztes Update</dt><dd class="num">${project.letztesUpdate ? formatDate(project.letztesUpdate) : "keines"}${project.veraltet ? ' <span class="flag">●</span>' : ""}</dd></div>
        <div><dt>Updates</dt><dd class="num">${n(project.updates.length)} im Zeitraum, ${n(project.updatesTotal)} total</dd></div>
      </dl>

      <div class="texts">
        <div class="textblock">
          <div class="eyebrow">Beschrieb</div>
          <div class="md">${markdownToHtml(project.kurzbeschrieb)}</div>
        </div>
        <div class="textblock textblock--dark">
          <div class="eyebrow">Angestrebte Wirkung</div>
          <div class="md">${markdownToHtml(project.wirkung)}</div>
        </div>
      </div>

      <div class="timeline">
        <div class="section-title"><h3>Updates</h3><span class="muted">neueste zuerst</span></div>
        ${entries ? `<div class="timeline__list">${entries}</div>` : '<div class="empty">Keine publizierten Updates im Berichtszeitraum.</div>'}
      </div>
    </section>`;
}

/** Fusszeile mit Seitenzahl für die A4-Ausgabe (Playwright footerTemplate). */
export function rechenschaftsberichtFooter(erstelltAm: Date): string {
  return `
<div style="width:100%;padding:0 48px;font-family:Inter,system-ui,sans-serif;font-size:8px;color:#555555;display:flex;justify-content:space-between;">
  <span>Projektbericht Prozessentwicklung, Gemeinde Altdorf, ${formatDate(erstelltAm)}</span>
  <span>Seite <span class="pageNumber"></span> von <span class="totalPages"></span></span>
</div>`;
}

export function renderRechenschaftsberichtHtml(
  report: Rechenschaftsbericht,
  options: { logoSrc: string; fontFaces?: string },
): string {
  const erstellt = formatDate(report.erstelltAm);
  const projects = report.projects
    .map((project, index) => renderProject(project, index, report.projects.length))
    .join("");

  return `<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <title>Projektbericht Prozessentwicklung</title>
  <style>${options.fontFaces ?? ""}${REPORT_STYLES}</style>
</head>
<body>
  <div class="sheet">
    ${docHeader(`Projektbericht<br>${erstellt}`, options.logoSrc)}
    <div class="eyebrow">Zuhanden Gemeinderat und RGPK</div>
    <h1>Projektbericht Prozessentwicklung</h1>
    <p class="lead">Übersicht über alle Projekte mit Kennzahlen, Projektsteckbriefen und den publizierten Updates im Berichtszeitraum ${periodLabel(report)}.</p>

    ${renderDashboard(report)}

    ${projects || '<div class="empty" style="margin-top:32px">Keine Projekte im Bericht.</div>'}

  </div>
</body>
</html>`;
}
