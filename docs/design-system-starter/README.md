# Design-System Starter

Kopierbares Minimal-Template für neue Next.js-Projekte im Hausstil Gemeinde Altdorf.

Vollständige Dokumentation: [../design-system.md](../design-system.md)

## Enthaltene Dateien

| Datei | Ziel im neuen Projekt |
|---|---|
| `globals.css` | Inhalt in `app/globals.css` einfügen (nach shadcn-Imports) |
| `AppHeader.tsx` | `components/layout/AppHeader.tsx` |
| `AppNav.tsx` | `components/layout/AppNav.tsx` |
| `page-header.tsx` | `components/layout/page-header.tsx` |
| `layout.example.tsx` | Referenz für `app/(app)/layout.tsx` |
| `font-imports.example.tsx` | Referenz für `app/layout.tsx` |

Zusätzlich benötigt (nicht in diesem Ordner):

- `public/logo-altdorf.png` aus dem Projektcockpit-Repo
- shadcn/ui initialisiert mit Style `base-nova`

## Schritt-für-Schritt

### 1. Abhängigkeiten

```bash
npm install @fontsource/inter @fontsource/space-grotesk
```

### 2. Schriften (`app/layout.tsx`)

Siehe `font-imports.example.tsx`. Die Imports vor `./globals.css` platzieren.

### 3. CSS

Den Inhalt von `globals.css` am Ende von `app/globals.css` einfügen. Die shadcn-Imports und `@theme inline` aus dem Projektcockpit übernehmen, falls noch nicht vorhanden.

Alternativ: gesamte `app/globals.css` aus dem Projektcockpit kopieren.

### 4. Komponenten

```bash
mkdir -p components/layout
cp docs/design-system-starter/AppHeader.tsx components/layout/
cp docs/design-system-starter/AppNav.tsx components/layout/
cp docs/design-system-starter/page-header.tsx components/layout/
```

### 5. AppHeader anpassen

In `AppHeader.tsx` Eyebrow und Titel an die neue Anwendung anpassen:

```tsx
<span className="ad-app-header__eyebrow">Gemeinde Altdorf</span>
<h1 className="ad-app-header__title">Meine Anwendung</h1>
```

### 6. Layout

Siehe `layout.example.tsx`. Navigation-Items in `AppNav.tsx` anpassen.

### 7. Logo

```bash
cp public/logo-altdorf.png /pfad/zum/neuen-projekt/public/
```

## Anpassbare Tokens

In `globals.css` unter `:root`:

| Token | Standard | Beschreibung |
|---|---|---|
| `--ad-fs-app-title` | 20px | App-Titel im Header |
| `--ad-header-logo-h-app` | 44px | Logo-Höhe Webapp (Standard: 32px) |
| `--ad-accent` | #b5121b | Wappenrot |

## Abweichungen dokumentieren

Weicht das neue Projekt vom Header-Standard ab (Eyebrow-Text, Logo-Grösse, fehlende Trennlinie), im Projekt-README unter «Abweichungen Header-Standard» festhalten.
