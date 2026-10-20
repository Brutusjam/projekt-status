# Betriebsanleitung Projektcockpit

## Übersicht

Single-Instance-Anwendung (Next.js, SQLite, Auth.js). Eine Schreibinstanz, kein Autoscaling.

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `DATABASE_URL` | ja | SQLite-Pfad, z.B. `file:/data/projektcockpit.db` (im Fly-Image und in `fly.toml` gesetzt) |
| `AUTH_SECRET` | ja | Geheimer Schlüssel für Sessions (Auth.js) |
| `AUTH_URL` | ja | Öffentliche Basis-URL (Auth.js v5) |
| `NEXTAUTH_URL` | ja | Alias/Kompatibilität zur öffentlichen URL |
| `APP_URL` | empfohlen | Basis-URL für Links (PDF, Mail) |
| `UPLOAD_DIR` | empfohlen | Verzeichnis für Update-PDF-Anhänge; Production: `/data/uploads`, lokal: `./data/uploads` |
| `RESEND_API_KEY` | für Mail | Resend API-Schlüssel (E5) |
| `RESEND_FROM` | für Mail | Verifizierte Absenderadresse (E5) |

Siehe [.env.example](.env.example).

HTTP Basic Auth (`BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD`) ist im Arbeitspapier optional vorgesehen, im Code noch nicht implementiert.

## Lokale Entwicklung

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Demo-Zugänge nach Seed:

- Admin: `admin@example.local` / `admin1234`
- Leser: `leser@example.local` / `leser1234`

Beim ersten Login ist ein Passwortwechsel erforderlich.

## Tests

```bash
npm test
```

## Deployment fly.io (Etappe A)

Voraussetzung: [flyctl](https://fly.io/docs/hands-on/install-flyctl/) installiert und `fly auth login`.

App-Name: `projektcockpit-altdorf`, Region: `fra`, Volume: `projektcockpit_data` → `/data`.

### 1. App und Volume anlegen (nur beim Erstaufbau)

```bash
fly apps create projektcockpit-altdorf
fly volumes create projektcockpit_data --region fra --size 1 --app projektcockpit-altdorf
```

### 2. Secrets setzen

Neuen Secret erzeugen (nicht den lokalen Dev-Wert verwenden):

```bash
# PowerShell: [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
# oder: openssl rand -base64 32

fly secrets set \
  AUTH_SECRET="..." \
  AUTH_URL="https://projektcockpit-altdorf.fly.dev" \
  NEXTAUTH_URL="https://projektcockpit-altdorf.fly.dev" \
  APP_URL="https://projektcockpit-altdorf.fly.dev" \
  --app projektcockpit-altdorf
```

### 3. Deploy und Scale

Standard ist der aktuelle Depot-Builder (Fly-Default). Eine Machine, kein HA:

```bash
fly deploy --depot=true --ha=false
fly scale count 1 --app projektcockpit-altdorf
```

Falls Depot aus dem Firmennetz (Firewall/Proxy) nicht erreichbar ist: Fallback auf den klassischen Fly-Builder mit `fly deploy --depot=false --ha=false`.

#### Automatisches Deployment über GitHub Actions

`.github/workflows/fly-deploy.yml` führt bei jedem Push und Pull Request Lint und Tests aus. Bei einem Push auf `master` (z.B. nach dem Mergen eines Pull Requests) wird anschliessend automatisch auf fly.io deployt. Manuell auslösen: GitHub → Actions → „Test & Deploy“ → „Run workflow“.

Einmalige Einrichtung:

```bash
fly tokens create deploy --app projektcockpit-altdorf
```

Den ausgegebenen Token in GitHub unter *Settings → Secrets and variables → Actions → New repository secret* als `FLY_API_TOKEN` speichern.

Der Container-Entrypoint setzt die Rechte auf `/data` (inkl. `uploads/`), führt `prisma migrate deploy` als User `nextjs` aus und startet danach die App. SQLite liegt unter `/data/projektcockpit.db`, PDF-Anhänge unter `/data/uploads/updates/`.

### Latenz / Cold Start

Die Machine bleibt dauerhaft warm (`min_machines_running = 1`, `auto_stop_machines = off`). Das vermeidet Aufwach-Latenz nach Idle, verursacht aber etwas höhere laufende Kosten als Scale-to-Zero.

### 4. Einmalig Seed (Bootstrap)

Nach dem ersten erfolgreichen Deploy, solange noch keine Benutzer existieren:

```bash
fly ssh console --app projektcockpit-altdorf -C "gosu nextjs npx prisma db seed"
```

Danach:

1. Login unter `https://projektcockpit-altdorf.fly.dev/login` mit `admin@example.local` / `admin1234`
2. Passwort sofort wechseln
3. Produktive Benutzer anlegen (Admin → Benutzer)
4. Demo-Leser deaktivieren oder Passwort ändern

Den Seed nicht erneut ausführen, wenn bereits produktive Daten vorliegen (Seed löscht alle Tabelleninhalte).

### 5. Smoke-Checkliste nach Deploy

- [ ] `https://projektcockpit-altdorf.fly.dev` leitet auf Login
- [ ] Admin-Login und Passwortwechsel funktionieren
- [ ] Admin-Übersicht zeigt Projekte (nach Seed)
- [ ] JSON-Export unter Admin → Export/Import läuft durch
- [ ] Optional: PDF-Export eines Projekts
- [ ] Genau eine Maschine: `fly status` / `fly scale show`
- [ ] Volume gemountet: `fly volumes list`

### Backup

- Das Volume enthält die SQLite-Datei **und** `uploads/` (PDF-Anhänge). Snapshots sichern beides.
- Volume-Grösse (aktuell 1 GB) beobachten, wenn viele PDFs angehängt werden.
- Tägliche Fly-Volume-Snapshots aktivieren:
  ```bash
  fly volumes snapshots schedule projektcockpit_data --app projektcockpit-altdorf
  ```
  (Falls der Subcommand in der installierten flyctl-Version abweicht: Snapshots in der Fly-Dashboard-UI unter Volumes aktivieren.)
- Regelmässig JSON-Export über Admin → Export/Import (Export-Version 2 enthält PDFs als Base64)
- Export auf internem Speicher (z.B. G:) ablegen

### Wiederherstellung

1. JSON-Export aus Backup (stellt DB und Anhänge wieder her)
2. Admin → Export/Import → Import starten
3. Oder Volume/Snapshot zurückspielen (DB und `uploads/` gemeinsam)

## Umzug interner Server (Etappe B)

1. JSON-Export oder SQLite-Datei vom Fly Volume sichern
2. Docker Compose auf interner VM starten:
   ```bash
   docker compose up -d --build
   ```
3. Bei SQLite-Datei: Volume `./data` mit Datei befüllen, `DATABASE_URL` anpassen
4. Bei JSON: Import über Admin-Oberfläche
5. `AUTH_URL`, `NEXTAUTH_URL` und internen DNS-Namen im Reverse Proxy setzen
6. Resend-Konfiguration unverändert übernehmen

## Benutzer anlegen

Admin → Benutzer → Neues Benutzerkonto. Initialpasswort wird vom Admin vergeben, Änderung beim ersten Login ist Pflicht.

## Mailversand

Manuell pro publiziertem Update über «Benachrichtigung senden». Voraussetzung: verifizierte Resend-Domain (SPF/DKIM). Erst ab Etappe E5.

## PDF-Export

Admin → Projekt → «PDF exportieren» oder Gesamtübersicht über `/api/admin/pdf/uebersicht`. Erfordert Playwright Chromium (im Docker-Image enthalten).

## Datenregel R4

Solange extern gehostet: keine Personendaten, keine vertraulichen Inhalte (Betriebsrichtlinie). Ein sichtbarer Admin-Banner ist bewusst nicht mehr vorhanden.

## Update-PDF-Anhänge

Pro Update kann genau ein PDF (max. 10 MB) angehängt werden. Dateien liegen unter `UPLOAD_DIR/updates/{updateId}.pdf`. Leser sehen den Download nur bei publizierten Updates.
