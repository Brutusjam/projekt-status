# Header-Standard Gemeinde Altdorf

Version 1.0, Juli 2026
Verantwortlich: Beat Schuler, Prozessverantwortlicher

## 1. Zweck und Geltungsbereich

Dieses Dokument definiert den verbindlichen Standard für den Kopfbereich aller intern entwickelten digitalen Artefakte der Gemeinde Altdorf:

- **Variante A: Dokument-Header (Briefkopf)** für PDF-Dokumente, Protokolle, Berichte und alle HTML-Dateien, die via Playwright zu PDF gerendert werden
- **Variante B: App-Header** für Webapps und browserbasierte Werkzeuge (Single-File-Tools, Next.js-Apps)

Der Standard richtet sich an Menschen und an KI-Entwicklungswerkzeuge. Er kann als Ganzes in einen Prompt, in `docs/` oder in `.cursor/rules/` übernommen werden.

**Klumpenrisiko-Grundsatz:** Alle Vorgaben sind so gehalten, dass jede Person mit Web-Grundkenntnissen den Header ohne Rückfragen reproduzieren kann. Keine externen Abhängigkeiten: Fonts und Logo werden als Base64 eingebettet oder liegen lokal im Repository.

## 2. Grundaufbau (beide Varianten)

Der Header besteht immer aus drei Zonen:

```
+--------------------------------------------------------------+
| [Kontext links]                    [Wappen + Wortmarke rechts]|
+==============================================================+   <- Trennlinie
| [optional: Adressblock / Meta-Zeile]                          |
+--------------------------------------------------------------+
```

1. **Links:** Kontext des Absenders oder der Anwendung. Im Dokument: Abteilung oder Gremium (z. B. «Gemeinderat», «Finanzabteilung»). In der Webapp: Anwendungsname.
2. **Rechts:** Wappen mit Wortmarke «Gemeinde Altdorf». Das Wappen steht immer rechts, nie links.
3. **Trennlinie:** Durchgehende horizontale Linie unterhalb der Kopfzeile, über die volle Inhaltsbreite.

## 3. Design-Tokens

Alle Farben, Schriften und Abstände werden als CSS Custom Properties definiert. KI-Werkzeuge sollen ausschliesslich diese Tokens verwenden, keine Hardcodes.

```css
:root {
  /* Farben */
  --ad-ink: #1a1a1a;            /* Primärer Text */
  --ad-ink-soft: #555555;       /* Sekundärer Text, Adressblock */
  --ad-rule: #1a1a1a;           /* Trennlinie Dokument */
  --ad-rule-soft: #d9d9d9;      /* Trennlinie Webapp */
  --ad-bg: #ffffff;             /* Hintergrund */
  --ad-accent: #b5121b;         /* Altdorfer Rot (Wappenrot), sparsam einsetzen */

  /* Typografie */
  --ad-font-head: 'Space Grotesk', system-ui, sans-serif;
  --ad-font-body: 'Inter', system-ui, sans-serif;
  --ad-fs-body: 12.5px;         /* Fliesstext Dokument */
  --ad-fs-app-body: 14px;       /* Fliesstext Webapp */

  /* Header-Masse */
  --ad-header-logo-h: 44px;     /* Wappen-Höhe Dokument */
  --ad-header-logo-h-app: 32px; /* Wappen-Höhe Webapp */
  --ad-header-gap: 24px;        /* Abstand Kopfzeile zu Trennlinie */
  --ad-rule-w: 1.5px;           /* Linienstärke Dokument */
}
```

**Schriften:** Space Grotesk für Titel und Eyebrow-Labels, Inter für alles andere. Bezug via `npm pack @fontsource/inter@5 @fontsource/space-grotesk@5`, Dateien nach Muster `[family]-latin-[weight]-normal.woff2`, als Base64-woff2 einbetten (Single-File-Tools) oder lokal unter `public/fonts/` ablegen (Next.js).

**Logo-Asset:** Transparentes PNG des Wappens mit Wortmarke, weisser Hintergrund entfernt, 6px Aussenabstand, mindestens 3-fache Zielauflösung (Lanczos). Ablage: `assets/logo-altdorf.png` bzw. als Base64-Data-URI in Single-File-Tools. Das Logo wird nie gestreckt, nie eingefärbt, nie auf farbigem Hintergrund platziert.

## 4. Variante A: Dokument-Header (PDF, Protokolle, Berichte)

Referenz ist der offizielle Word-Briefkopf der Gemeinde. Aufbau von oben nach unten:

1. Kopfzeile: Abteilung/Gremium links (Inter, 12.5px, fett), Wappen rechts
2. Trennlinie über volle Breite
3. Adressblock links (Inter, 12.5px, `--ad-ink-soft`): Strasse, PLZ Ort, Telefon
4. Rechts auf Höhe des Adressblocks: Dokumenttyp und Datum, fett (z. B. «Auszug aus dem Protokoll vom: 18. August 2025»)

### Referenz-Implementation

```html
<header class="ad-doc-header">
  <div class="ad-doc-header__top">
    <div class="ad-doc-header__context">Gemeinderat</div>
    <img class="ad-doc-header__logo" src="assets/logo-altdorf.png" alt="Gemeinde Altdorf">
  </div>
  <hr class="ad-doc-header__rule">
  <div class="ad-doc-header__meta">
    <address class="ad-doc-header__address">
      Tellsgasse 25<br>
      6460 Altdorf<br>
      Telefon 041 874 12 20
    </address>
    <div class="ad-doc-header__docinfo">
      <strong>Kurzprotokoll vom:<br>07. Juli 2026</strong>
    </div>
  </div>
</header>
```

```css
.ad-doc-header__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--ad-header-gap);
}
.ad-doc-header__context {
  font-family: var(--ad-font-body);
  font-size: var(--ad-fs-body);
  font-weight: 700;
  color: var(--ad-ink);
}
.ad-doc-header__logo { height: var(--ad-header-logo-h); width: auto; }
.ad-doc-header__rule {
  border: none;
  border-top: var(--ad-rule-w) solid var(--ad-rule);
  margin: 0 0 16px 0;
}
.ad-doc-header__meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-family: var(--ad-font-body);
  font-size: var(--ad-fs-body);
}
.ad-doc-header__address {
  font-style: normal;
  color: var(--ad-ink-soft);
  line-height: 1.5;
}
.ad-doc-header__docinfo { text-align: left; color: var(--ad-ink); line-height: 1.5; }
```

### PDF-Rendering (verbindlich)

- Pipeline: Playwright Chromium (`sync_playwright`), Viewport 794 x 1123px, `device_scale_factor=2`
- Nach dem Laden `document.body.scrollHeight` auslesen, dann `pg.pdf()` mit explizitem `width='794px'`, `height=f'{h+2}px'`, alle Margins 0, `print_background=True`
- Bevorzugt einseitiges, durchlaufendes PDF ohne Seitenumbrüche
- Grosszügiges `padding` auf dem `.sheet`-Container in CSS belassen, nicht für Print-Media auf null setzen
- Bei mehrseitigen Dokumenten: Header nur auf Seite 1, Folgeseiten erhalten eine schlanke Kopfzeile mit «Gemeinde Altdorf» und Seitenzahl («Seite 2 von 4»)

## 5. Variante B: App-Header (Webapps und Browser-Tools)

Schlanker als der Briefkopf. Aufbau:

1. Einzeilige Kopfleiste: Anwendungsname links (Space Grotesk, 16 bis 18px, fett), darunter optional ein Eyebrow-Label (Space Grotesk, 11px, Versalien, letter-spacing 0.08em, `--ad-ink-soft`) mit dem Zusatz «Gemeinde Altdorf», Wappen rechts (32px Höhe)
2. Dünne Trennlinie (`--ad-rule-soft`, 1px)
3. Kein Adressblock

### Referenz-Implementation

```html
<header class="ad-app-header">
  <div class="ad-app-header__id">
    <span class="ad-app-header__eyebrow">Gemeinde Altdorf</span>
    <h1 class="ad-app-header__title">EWK Scankontrolle</h1>
  </div>
  <img class="ad-app-header__logo" src="assets/logo-altdorf.png" alt="Gemeinde Altdorf">
</header>
```

```css
.ad-app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--ad-rule-soft);
  background: var(--ad-bg);
}
.ad-app-header__eyebrow {
  display: block;
  font-family: var(--ad-font-head);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ad-ink-soft);
}
.ad-app-header__title {
  margin: 2px 0 0 0;
  font-family: var(--ad-font-head);
  font-size: 17px;
  font-weight: 700;
  color: var(--ad-ink);
}
.ad-app-header__logo { height: var(--ad-header-logo-h-app); width: auto; }
```

**Next.js/shadcn-Hinweis (Bauabteilungs-Tool):** Der App-Header wird als Server Component `components/layout/AppHeader.tsx` umgesetzt. Tokens in `globals.css` unter `:root` pflegen, Tailwind-Klassen dürfen die Tokens via `var(...)` referenzieren. Logo unter `public/logo-altdorf.png`.

## 6. Verbindliche Regeln (Checkliste für KI-Werkzeuge)

1. Wappen immer rechts, Kontext immer links
2. Nur die definierten Tokens verwenden, keine Hardcode-Farben oder -Schriftgrössen im Header
3. Fonts und Logo eingebettet oder lokal, keine CDN- oder Google-Fonts-Links
4. Space Grotesk nur für Titel und Eyebrow, Inter für alles andere
5. Schweizer Schreibweise: kein ß, Datum als TT.MM.JJJJ, Apostroph als Tausendertrennzeichen
6. Keine Gedanken- oder Halbgeviertstriche als Satzzeichen in sichtbaren Texten
7. Alt-Text des Logos immer «Gemeinde Altdorf»
8. Header-Markup mit `ad-`-Präfix benennen (Namenskollisionen vermeiden)
9. Bei PDF-Ausgabe die Playwright-Pipeline aus Abschnitt 4 verwenden, keine anderen PDF-Bibliotheken für gestaltete Dokumente
10. Abweichungen vom Standard sind möglich, müssen aber im Projekt-README unter «Abweichungen Header-Standard» dokumentiert werden

## 7. Offene Punkte

- K1: Exakter Farbwert des Wappenrots aus dem offiziellen Logo verifizieren (aktuell Annahme #b5121b), einmalig per Pipette aus dem PNG bestimmen und hier fixieren
- K2: Entscheid, ob der App-Header in dunklem Modus eine eigene Token-Variante erhält oder Webapps grundsätzlich hell bleiben
