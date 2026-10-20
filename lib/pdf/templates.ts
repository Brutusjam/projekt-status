import { formatDate } from "@/lib/format";
import { getProjektStatusLabel } from "@/lib/labels";
import type { ProjektStatus } from "@/app/generated/prisma/client";

type ProjectPdfData = {
  titel: string;
  abteilung: string;
  ansprechperson: string;
  status: ProjektStatus;
  startdatum: Date;
  kurzbeschrieb: string;
  wirkung: string;
  updates: Array<{
    datum: Date;
    kurztitel: string;
    detailtext: string;
  }>;
};

type OverviewProject = {
  titel: string;
  abteilung: string;
  status: ProjektStatus;
  letztesUpdate: string | null;
};

const DOC_STYLES = `
:root {
  --ad-ink: #1a1a1a;
  --ad-ink-soft: #555555;
  --ad-rule: #1a1a1a;
  --ad-bg: #ffffff;
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
  color: var(--ad-ink);
  background: var(--ad-bg);
}
.sheet { padding: 48px; }
.ad-doc-header__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: var(--ad-header-gap);
}
.ad-doc-header__context {
  font-weight: 700;
  font-size: 12.5px;
}
.ad-doc-header__logo { height: var(--ad-header-logo-h); width: auto; }
.ad-doc-header__rule {
  border: none;
  border-top: var(--ad-rule-w) solid var(--ad-rule);
  margin: 0 0 20px 0;
}
.ad-doc-header__meta {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}
.ad-doc-header__address {
  font-style: normal;
  color: var(--ad-ink-soft);
  line-height: 1.5;
}
.ad-doc-header__docinfo { text-align: right; font-weight: 700; line-height: 1.5; }
h1 {
  font-family: var(--ad-font-head);
  font-size: 20px;
  margin: 0 0 8px 0;
}
h2 {
  font-family: var(--ad-font-head);
  font-size: 14px;
  margin: 24px 0 8px 0;
}
.meta-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 6px 12px;
  margin: 16px 0;
}
.update {
  border-top: 1px solid #e5e5e5;
  padding: 12px 0;
}
.update-title { font-weight: 700; margin-bottom: 4px; }
.muted { color: var(--ad-ink-soft); }
table { width: 100%; border-collapse: collapse; margin-top: 12px; }
th, td { border-bottom: 1px solid #e5e5e5; padding: 8px 4px; text-align: left; }
th { font-weight: 700; }
`;

function docHeader(context: string, docinfo: string, logoUrl: string) {
  return `
<header class="ad-doc-header">
  <div class="ad-doc-header__top">
    <div class="ad-doc-header__context">${escapeHtml(context)}</div>
    <img class="ad-doc-header__logo" src="${logoUrl}" alt="Gemeinde Altdorf">
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function markdownToPlain(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/\n/g, "<br>");
}

export function renderProjectPdfHtml(
  project: ProjectPdfData,
  logoUrl: string,
): string {
  const today = formatDate(new Date());
  const updatesHtml = project.updates
    .map(
      (update) => `
      <article class="update">
        <div class="muted">${formatDate(update.datum)}</div>
        <div class="update-title">${escapeHtml(update.kurztitel)}</div>
        <div>${markdownToPlain(escapeHtml(update.detailtext))}</div>
      </article>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <style>${DOC_STYLES}</style>
</head>
<body>
  <div class="sheet">
    ${docHeader("Prozess & Digital", `<strong>Projektbericht<br>${today}</strong>`, logoUrl)}
    <h1>${escapeHtml(project.titel)}</h1>
    <div class="meta-grid">
      <div class="muted">Abteilung</div><div>${escapeHtml(project.abteilung)}</div>
      <div class="muted">Ansprechperson</div><div>${escapeHtml(project.ansprechperson)}</div>
      <div class="muted">Status</div><div>${escapeHtml(getProjektStatusLabel(project.status))}</div>
      <div class="muted">Startdatum</div><div>${formatDate(project.startdatum)}</div>
    </div>
    <h2>Kurzbeschrieb</h2>
    <p>${escapeHtml(project.kurzbeschrieb)}</p>
    <h2>Wirkung</h2>
    <p>${escapeHtml(project.wirkung)}</p>
    <h2>Updates</h2>
    ${updatesHtml || "<p class=\"muted\">Keine publizierten Updates.</p>"}
  </div>
</body>
</html>`;
}

export function renderOverviewPdfHtml(
  projects: OverviewProject[],
  logoUrl: string,
): string {
  const today = formatDate(new Date());
  const rows = projects
    .map(
      (project) => `
      <tr>
        <td>${escapeHtml(project.titel)}</td>
        <td>${escapeHtml(project.abteilung)}</td>
        <td>${escapeHtml(getProjektStatusLabel(project.status))}</td>
        <td>${project.letztesUpdate ? escapeHtml(project.letztesUpdate) : "–"}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <style>${DOC_STYLES}</style>
</head>
<body>
  <div class="sheet">
    ${docHeader("Prozess & Digital", `<strong>Gesamtübersicht<br>${today}</strong>`, logoUrl)}
    <h1>Projektcockpit Prozessentwicklung</h1>
    <table>
      <thead>
        <tr>
          <th>Projekt</th>
          <th>Abteilung</th>
          <th>Status</th>
          <th>Letztes Update</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`;
}

export type { ProjectPdfData, OverviewProject };
