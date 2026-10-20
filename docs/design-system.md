# Design-System Gemeinde Altdorf

Version 1.0, Juli 2026  
Quelle: Projektcockpit Prozessentwicklung  
Verwandte Dokumente: [header-standard-altdorf.md](./header-standard-altdorf.md)

Dieses Dokument beschreibt das visuelle System (Schrift, Farbe, Header, UI-Muster) zur Wiederverwendung in anderen Next.js-Projekten der Gemeinde Altdorf. Ein kopierbares Starter-Template liegt unter `docs/design-system-starter/`.

---

## 1. Technischer Stack

| Bereich | Wahl |
|---|---|
| CSS | Tailwind CSS v4 |
| UI | shadcn/ui, Style `base-nova`, Icons Lucide |
| Schriften | @fontsource (lokal, kein CDN) |
| Farben App | OKLCH (Rosé/Rot, Hue ~355) |
| Farben Header | Hex (`--ad-*` Tokens) |

### Abhängigkeiten

```bash
npm install @fontsource/inter @fontsource/space-grotesk tailwindcss tw-animate-css shadcn
```

### Schriften einbinden (`app/layout.tsx`)

```tsx
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
```

### HTML-Root

```tsx
<html lang="de-CH" className="h-full antialiased">
  <body className="min-h-full flex flex-col">
```

---

## 2. Typografie

### Schriftrollen

| Rolle | Schrift | Einsatz |
|---|---|---|
| Fliesstext | **Inter** | Body, Navigation, Formulare, Beschreibungen |
| Titel | **Space Grotesk** | h1–h4, Karten-Titel, Seitenüberschriften, Header |

### Gewichte

- Inter: 400, 500
- Space Grotesk: 500, 600, 700

### CSS-Variablen

```css
--font-inter: "Inter", system-ui, sans-serif;
--font-space-grotesk: "Space Grotesk", system-ui, sans-serif;
--font-sans: var(--font-inter);       /* Tailwind body */
--font-heading: var(--font-space-grotesk); /* Tailwind font-heading */
```

Alle `h1–h4` erhalten automatisch Space Grotesk. Für einzelne Elemente: Klasse `font-heading`.

### Eyebrow-Label

Wiederkehrendes Muster für Kategorie-Labels über Überschriften:

```css
.eyebrow {
  font-size: 0.75rem;      /* text-xs */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--brand-rose-strong);
}
```

Tailwind-Utility in `globals.css`: Klasse `.eyebrow`.

---

## 3. Farbpalette

### Header-Tokens (`--ad-*`)

Unabhängig vom shadcn-Theme. Für Briefkopf und App-Header verbindlich.

| Token | Wert | Verwendung |
|---|---|---|
| `--ad-ink` | `#1a1a1a` | Primärtext |
| `--ad-ink-soft` | `#555555` | Sekundärtext, Eyebrow, Navigation |
| `--ad-rule` | `#1a1a1a` | Trennlinie Dokument (1.5px) |
| `--ad-rule-soft` | `#d9d9d9` | Trennlinie Webapp (1px) |
| `--ad-bg` | `#ffffff` | Header-Hintergrund |
| `--ad-accent` | `#b5121b` | Altdorfer Wappenrot (sparsam) |

### App-Theme (OKLCH)

Rosé-getönter Hintergrund, Primärfarbe nahe Wappenrot.

| Token | OKLCH | Verwendung |
|---|---|---|
| `--background` | `oklch(0.99 0.012 355)` | Seitenhintergrund |
| `--foreground` | `oklch(0.24 0.03 260)` | Fliesstext |
| `--primary` | `oklch(0.52 0.14 355)` | Buttons, Links |
| `--primary-foreground` | `oklch(0.99 0.01 355)` | Text auf Primary |
| `--brand-rose` | `oklch(0.94 0.045 355)` | Karten-Rahmen, Hover |
| `--brand-rose-muted` | `oklch(0.97 0.025 355)` | Nav-Hover, Flächen |
| `--brand-rose-strong` | `oklch(0.52 0.14 355)` | Eyebrow, Akzentlinie |
| `--muted-foreground` | `oklch(0.48 0.04 355)` | Sekundärtext |
| `--border` | `oklch(0.9 0.03 355)` | Rahmen |
| `--accent-block` | `oklch(0.3 0.07 355)` | Dunkler Hervorhebungsblock |
| `--accent-block-foreground` | `oklch(0.98 0.02 355)` | Text auf Akzentblock |
| `--radius` | `0.75rem` | Basis-Eckenradius (12px) |

Vollständige Token-Liste: `app/globals.css` unter `:root`.

### Statusfarzen (Badges)

| Status | Hintergrund | Vordergrund |
|---|---|---|
| IDEE | `oklch(0.88 0.01 260)` grau | `oklch(0.35 0.02 260)` |
| IN_ABKLAERUNG | `oklch(0.88 0.06 250)` blau | `oklch(0.32 0.08 250)` |
| IN_UMSETZUNG | `oklch(0.9 0.08 85)` amber | `oklch(0.38 0.1 75)` |
| PILOTBETRIEB | `oklch(0.88 0.08 300)` violett | `oklch(0.34 0.1 300)` |
| ABGESCHLOSSEN | `oklch(0.9 0.06 145)` grün | `oklch(0.32 0.08 145)` |
| PAUSIERT | `oklch(0.95 0.005 106)` + Rahmen | `oklch(0.45 0.02 260)` |

Badge-Stil: `inline-flex rounded-full px-2.5 py-1 text-xs font-medium`.

---

## 4. Logo

| Eigenschaft | Wert |
|---|---|
| Datei | `public/logo-altdorf.png` |
| Inhalt | Wappen + Wortmarke «Gemeinde Altdorf» |
| Alt-Text | immer «Gemeinde Altdorf» |
| Regeln | nie strecken, nie einfärben, nie auf farbigem Hintergrund |

| Kontext | Token | Höhe |
|---|---|---|
| Dokument/PDF | `--ad-header-logo-h` | 44px |
| Webapp (Standard) | `--ad-header-logo-h-app` | 32px |
| Webapp (Projektcockpit) | `--ad-header-logo-h-app` | 44px |

---

## 5. Header-System

### Grundaufbau

```
[Kontext links]                    [Wappen + Wortmarke rechts]
═══════════════════════════════════════════════════════════════
[Navigation / Adressblock]
```

Wappen immer rechts. Details: [header-standard-altdorf.md](./header-standard-altdorf.md).

### Variante B: App-Header (Webapp)

Komponente: `components/layout/AppHeader.tsx`

| Element | Schrift | Grösse | Gewicht |
|---|---|---|---|
| Eyebrow | Space Grotesk | 11px | 500, Versalien, letter-spacing 0.08em |
| Titel | Space Grotesk | 20px (Standard: 17px) | 700 |
| Logo | — | 44px Höhe (Standard: 32px) | — |

Padding Header: 30px oben, 22px unten. Container: max-width 90rem, seitlich 1.5rem.

CSS-Klassen mit Präfix `ad-app-header__*`. Tokens via `--ad-*`, keine Hardcodes.

### Navigation

Komponente: `components/layout/AppNav.tsx`

- Links: Inter 14px, 500, `--ad-ink-soft`
- Hover: Hintergrund `--brand-rose-muted`, Text `--ad-ink`
- Transition: 150ms ease

### Seiten-Container

Klasse `.ad-page-shell`: max-width 90rem, zentriert, padding 0 1.5rem.

### Variante A: Dokument-Header

Für PDF und Briefkopf: Klassen `ad-doc-header__*`. Siehe [header-standard-altdorf.md](./header-standard-altdorf.md), Abschnitt 4.

---

## 6. UI-Muster

### Seitenüberschrift (`PageHeader`)

```tsx
<div className="space-y-3 border-l-4 border-brand-rose-strong pl-5">
  <p className="eyebrow">{eyebrow}</p>
  <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
  {description && (
    <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
      {description}
    </p>
  )}
</div>
```

Links: 4px roter Akzentstreifen (`border-brand-rose-strong`).

### Karten

- Rahmen: `border-brand-rose/60`
- Hover: `border-brand-rose shadow-md`
- Titel: `font-heading text-xl`
- Meta-Labels: Klasse `.eyebrow`

### Dunkler Akzentblock

Für hervorgehobene Inhalte:

```tsx
<aside className="rounded-2xl bg-accent-block p-6 text-accent-block-foreground">
  <p className="eyebrow mb-3 text-accent-block-foreground/70">Titel</p>
  <p className="leading-relaxed">Inhalt</p>
</aside>
```

### Timeline-Einträge

- Karte: `rounded-xl border bg-card`, Hover `border-brand-rose/70`
- Aufklappen: Animation `timeline-detail-in` (180ms ease-out)
- Titel: `font-heading`

### Hinweis-Box (Warnung)

```tsx
className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950"
```

### Login-Seite

Bewusst neutral: kein Wappen, kein Gemeindename, kein App-Header.

---

## 7. Layout-Struktur

```tsx
<>
  <AppHeader />
  <AppNav />
  <main className="ad-page-shell flex-1 py-10">
    {children}
  </main>
</>
```

Abstände zwischen Sektionen: `space-y-10`. Grids: `md:grid-cols-2` (Karten), `lg:grid-cols-[2fr_1fr]` (Detail).

---

## 8. Animationen

| Effekt | Wert |
|---|---|
| Nav-Hover | 150ms ease |
| Karten-Schatten | transition-shadow |
| Timeline-Aufklappen | 180ms ease-out, translateY -4px → 0 |
| Button-Klick | leichtes translate-y-px |

Keine Effekt-Bibliotheken ausser `tw-animate-css` (shadcn-Standard).

---

## 9. Textkonventionen

- Schweizer Hochdeutsch, kein ß
- Datum: TT.MM.JJJJ
- Tausendertrennzeichen: Apostroph (z. B. 1'000)
- Keine Gedankenstriche als Satzzeichen
- Enum-Werte im Code englisch (SCREAMING_SNAKE_CASE), Anzeige deutsch

---

## 10. Übernahme in ein neues Projekt

### Schnellstart

1. Ordner `docs/design-system-starter/` kopieren
2. `globals.css` Inhalt in `app/globals.css` einfügen (nach shadcn-Imports)
3. Komponenten nach `components/layout/` kopieren
4. Logo nach `public/logo-altdorf.png` kopieren
5. Schriften in `app/layout.tsx` importieren
6. shadcn mit `style: base-nova`, `cssVariables: true` konfigurieren

Details: [design-system-starter/README.md](./design-system-starter/README.md)

### Checkliste

- [ ] @fontsource/inter und @fontsource/space-grotesk installiert
- [ ] Alle `:root`-Tokens in globals.css
- [ ] Logo unter public/logo-altdorf.png
- [ ] AppHeader mit korrektem Eyebrow und Titel
- [ ] Login-Seite ohne Gemeinde-Branding
- [ ] Abweichungen vom Header-Standard dokumentiert

---

## 11. Abweichungen Projektcockpit vs. Standard

| Punkt | Standard | Projektcockpit |
|---|---|---|
| Eyebrow Header | «GEMEINDE ALTDORF» | «Prozess & Digital» |
| App-Titel Grösse | 17px | 20px |
| Logo-Höhe Webapp | 32px | 44px |

---

## 12. Referenzdateien

| Datei | Inhalt |
|---|---|
| `app/globals.css` | Tokens, Header-CSS, Utilities |
| `docs/header-standard-altdorf.md` | Header-Spezifikation |
| `docs/design-system-starter/` | Kopierbares Starter-Template |
| `components/layout/AppHeader.tsx` | Webapp-Header |
| `components/layout/AppNav.tsx` | Navigation |
| `components/layout/page-header.tsx` | Seitenüberschriften |
| `components/projekte/status-badge.tsx` | Statusfarben |
| `public/logo-altdorf.png` | Logo-Asset |
