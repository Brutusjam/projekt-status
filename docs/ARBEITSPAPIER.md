# Arbeitspapier: Projektcockpit Prozessentwicklung

**Version:** 0.1 (Arbeitstitel, Entwurf)
**Datum:** 07.07.2026
**Verantwortlich:** Beat Schuler, Prozessverantwortlicher Gemeinde Altdorf
**Zweck des Dokuments:** Grundlage für die Entwicklung (Cursor), gleichzeitig Betriebs- und Klumpenrisiko-Dokumentation. Offene Punkte sind als K-Tags markiert.

---

## 1. Zweck und Kontext

Zentrale Online-Übersicht aller laufenden Projekte des Prozessverantwortlichen: Vorhaben aus den 1:1 mit den Abteilungsleitungen sowie direkte Entwicklungen mit Sachbearbeitenden. Das Cockpit macht den Stand jedes Projekts für die Anspruchsgruppen sichtbar und dokumentiert den Verlauf chronologisch über kurze Update-Einträge.

Das Cockpit ist ein Kommunikations- und Führungsinstrument, kein System of Record. Die Inhalte dienen zusätzlich als Quelle für den Monatsbericht und den Zweijahresbericht an den Gemeinderat (Wirkung vor Aktivität).

## 2. Rollen und Rechte

| Rolle | Rechte |
|---|---|
| **Admin** (nur Beat Schuler) | Projekte anlegen, ändern, archivieren. Updates erfassen, publizieren, löschen. Status und Termine pflegen. Benutzerkonten verwalten. Export auslösen. |
| **Leser** (Anspruchsgruppen) | Ausschliesslich lesender Zugriff auf publizierte Inhalte. Kein Kommentieren, kein Bearbeiten. |

Keine Selbstregistrierung. Leserkonten werden vom Admin angelegt (Name, E-Mail, Initialpasswort mit Änderungszwang beim ersten Login).

## 3. Datenmodell

```
BENUTZER ── (liest) ──> PROJEKT ──< UPDATE
                                        │
                                   MAILVERSAND (V2)
```

### BENUTZER
| Feld | Typ | Bemerkung |
|---|---|---|
| id | ID | |
| name | Text | |
| email | Text, unique | zugleich Loginname, Grundlage Mailversand V2 |
| rolle | Enum: ADMIN, LESER | |
| passwortHash | Text | argon2 oder bcrypt |
| mustChangePassword | Bool | true bei Kontoerstellung |
| mailAbo | Bool | Vorbereitung V2, Default true |
| aktiv | Bool | Deaktivieren statt Löschen |

### PROJEKT
| Feld | Typ | Bemerkung |
|---|---|---|
| id | ID | |
| titel | Text | |
| abteilung | Text | z.B. Bau, Finanzen, Kanzlei, EWK, übergreifend |
| ansprechperson | Text | Kürzel genügt, z.B. CM |
| status | Enum | siehe Status-Set |
| startdatum | Datum | |
| naechsterTermin | Datum, optional | mit Kurzbezeichnung (Text) |
| kurzbeschrieb | Text | 2 bis 3 Sätze |
| wirkung | Text | erwarteter bzw. erzielter Nutzen, Pflichtfeld |
| archiviert | Bool | |
| createdAt / updatedAt | Timestamp | |

**Status-Set:** IDEE, IN_ABKLAERUNG, IN_UMSETZUNG, PILOTBETRIEB, ABGESCHLOSSEN, PAUSIERT

### UPDATE
| Feld | Typ | Bemerkung |
|---|---|---|
| id | ID | |
| projektId | FK | |
| datum | Datum | vom Admin setzbar, Default heute |
| kurztitel | Text | erscheint in der Timeline, klickbar |
| detailtext | Text | Markdown-fähig, klappt bei Klick auf |
| status | Enum: ENTWURF, PUBLIZIERT | Leser sehen nur PUBLIZIERT |
| publiziertAm | Timestamp, optional | Anker für Mailversand V2 |

### MAILVERSAND (V2)
Protokolltabelle: updateId, empfaenger, gesendetAm, status. Dient der Nachvollziehbarkeit und verhindert Doppelversand.

## 4. Ansichten

1. **Login:** neutrale Anmeldemaske ohne Hinweis auf Inhalt oder Gemeinde (Aussenwirkung minimal, solange extern gehostet)
2. **Was ist neu (Startseite Leser):** chronologischer Feed der letzten publizierten Updates über alle Projekte, je mit Projekttitel, Datum, Kurztitel, aufklappbarem Detail
3. **Projektübersicht:** Karten mit Titel, Abteilung, Status-Badge, letztem Update, nächstem Termin. Filter nach Abteilung und Status. Archivierte Projekte in separater Ansicht
4. **Projektdetail:** Kopfbereich mit Eckdaten und Wirkung, darunter Update-Timeline (absteigend, Kurztitel klickbar)
5. **Admin-Bereich:** Projekte und Updates verwalten, Publizieren-Aktion, Benutzerverwaltung, JSON-Export/Import

## 5. Regeln

- **R1:** Nur der Admin schreibt. Leser haben keinerlei Schreiboperationen, serverseitig durchgesetzt (nicht nur im UI ausgeblendet).
- **R2:** Updates kennen die Zustände ENTWURF und PUBLIZIERT. Leser sehen ausschliesslich publizierte Updates und keine leeren Projekte ohne publizierten Inhalt.
- **R3:** Die Update-Timeline ist chronologisch absteigend sortiert nach `datum`, bei gleichem Datum nach Erfassungszeitpunkt.
- **R4:** Solange extern gehostet wird, gilt: keine Personendaten, keine vertraulichen Inhalte in Titeln, Beschrieben und Updates. Personen nur als Kürzel oder Funktion. Diese Regel steht sichtbar im Admin-Bereich.
- **R5:** Das Status-Set ist fix definiert. Statuswechsel und Termine ändert nur der Admin, es gibt keine Automatismen.
- **R6:** Abgeschlossene Projekte werden archiviert, nicht gelöscht. Löschen ist nur für Fehleingaben vorgesehen.
- **R7:** Der JSON-Export umfasst alle Entitäten vollständig und ist mit dem Import verlustfrei wiederherstellbar (Datenhoheit, Anbieterunabhängigkeit).
- **R8:** Benachrichtigungsmails enthalten nur Projekttitel, Update-Kurztitel und Link ins Cockpit. Kein Detailtext in der Mail (Datenminimierung, da Versand über Drittanbieter).
- **R9:** Login mit Rate Limiting (z.B. 5 Versuche, danach Sperrfrist). Sessions mit begrenzter Laufzeit. HTTPS erzwungen.
- **R10:** Es läuft genau eine Instanz der Anwendung (SQLite, ein Schreibprozess). Kein Auto-Scaling, keine zweite Maschine.
- **R11:** Alle Geschäftslogik liegt serverseitig in `lib/domain/`, das UI ist dünn. Vitest-Suite gegen `lib/domain/` als Abnahmekriterium pro Etappe.

## 6. Design

Anlehnung an den Altdorfer Kurzprotokoll-Stil. shadcn/ui dient als Komponentenbasis, die Defaults werden nicht übernommen: eigenes Theme (Farbtokens, Typografie, Radien, Abstände) wird vor der ersten Ansicht definiert. Ziel ist ein ruhiges, hochwertiges Erscheinungsbild mit dezenten Übergängen und grosszügigem Weissraum, keine Effekt-Bibliotheken.

- **Typografie:** Space Grotesk (Titel), Inter (Fliesstext), via @fontsource lokal gebundelt, keine externen Font-CDNs
- **Elemente:** Eyebrow-Labels für Abschnitte, Karten mit Status-Badges, dunkler Akzentblock für Hervorhebungen, Wappen und Briefkopf-Logik im Header
- **Statusfarben (Vorschlag):** IDEE grau, IN_ABKLAERUNG blau, IN_UMSETZUNG gelb/amber, PILOTBETRIEB violett, ABGESCHLOSSEN grün, PAUSIERT hellgrau mit Rahmen
- **Sprache:** Schweizer Hochdeutsch, kein ß, Datumsformat TT.MM.JJJJ

## 7. Architektur und Stack

| Ebene | Wahl | Begründung |
|---|---|---|
| Framework | Next.js (App Router), TypeScript strict | identisch mit Bauabteilungs-Tool, kein neues Klumpenrisiko |
| UI | Tailwind + shadcn/ui | dito |
| Datenbank | SQLite via Prisma | ein Schreiber, eine Datei, triviales Backup und Umzug |
| Auth | Auth.js v5, Credentials | bekanntes Muster, keine Fremdanbieter-Logins |
| Validierung | Zod | serverseitig an jeder Schreiboperation |
| Tests | Vitest gegen lib/domain/ | Abnahmekriterium |
| Mail (V2) | Resend (API) | siehe Abschnitt 8 |

## 8. Mailversand mit Resend (V2, jetzt eingeplant)

**Warum Resend:** API-basiert (kein SMTP-Gefrickel), funktioniert identisch von fly.io wie später vom internen Server aus (ausgehende HTTPS-Verbindung genügt). Der spätere Umzug bricht den Mailversand also nicht. Das Gratiskontingent (aktuell 3'000 Mails/Monat, 100/Tag) reicht bei diesem Nutzerkreis dauerhaft.

**Funktionsweise:** Beim Publizieren eines Updates (bzw. je nach Trigger-Entscheid, siehe K2) versendet die Anwendung über die Resend-API eine Mail an alle aktiven Leser mit `mailAbo = true`. Inhalt gemäss R8: Projekttitel, Kurztitel, Link. Jeder Versand wird in MAILVERSAND protokolliert.

**Voraussetzung Absenderdomain:** Resend verlangt eine verifizierte Absenderdomain (DNS-Einträge für SPF und DKIM). Realistische Varianten:

1. Subdomain von altdorf.ch, z.B. `cockpit.altdorf.ch` oder `mail.altdorf.ch`, Absender etwa `cockpit@mail.altdorf.ch`. Sauberste Lösung, braucht DNS-Einträge durch die Stelle, die altdorf.ch verwaltet (siehe K1)
2. Übergangsweise eine separate, neutrale Domain, die Beat selbst verwaltet. Funktioniert sofort, wirkt aber weniger offiziell und landet eher im Spam

**Vorbereitung im MVP:** Feld `mailAbo` am Benutzer, Zustand PUBLIZIERT mit `publiziertAm` am Update, Tabelle MAILVERSAND im Schema. Damit ist V2 ein reiner Anbau ohne Migration.

## 9. Deployment

### Etappe A: fly.io (jetzt)
- Region `fra` (Frankfurt), die nächstgelegene. Korrektur zur früheren Aussage: fly.io bietet keine Region Zürich
- Genau eine Maschine, `auto_stop` erlaubt, kein Scaling (R10)
- SQLite-Datei auf einem persistenten Fly Volume
- Backups: tägliche Volume-Snapshots von fly.io, zusätzlich regelmässiger manueller JSON-Export auf G: (Empfehlung: nach jedem grösseren Pflegeblock)
- Kosten: einstellige Franken pro Monat

### Etappe B: interner Server (nach Verfügbarkeit IT)
- Docker Compose auf interner VM/LXC, Reverse Proxy mit internem Zertifikat, interner DNS-Name, Backup über bestehende Routine
- **Umzug:** SQLite-Datei vom Fly Volume herunterladen, intern einsetzen, Umgebungsvariablen anpassen, fertig. Resend läuft unverändert weiter
- Nach dem Umzug kann die Vertraulichkeitsstufe pro Projekt eingeführt und R4 gelockert werden

## 10. Sicherheit und Datenregeln (fly.io-Phase)

- Öffentlich erreichbar, Login als Hauptschutz, deshalb R9 zwingend ab Etappe 1
- Optionale zweite Schicht gegen automatisierte Scanner: HTTP Basic Auth vor der ganzen Anwendung (ein gemeinsamer technischer Schlüssel, für Leser ein einmaliger Browser-Dialog)
- Datenregel R4 gilt strikt und ist gegenüber dem Gemeindeschreiber proaktiv deklariert: bewusster Zwischenschritt, Umzug auf internen Server geplant
- Kein Tracking, keine externen Skripte, Fonts lokal gebundelt

## 11. Klumpenrisiko-Absicherung

- Standardstack, identisch mit dem Bauabteilungs-Tool: wer eines betreiben kann, kann beide
- Dieses Arbeitspapier plus eine kurze Betriebsanleitung (BETRIEB.md im Repo): Deployment, Backup, Wiederherstellung aus JSON-Export, Benutzer anlegen
- Datenhoheit über R7 (vollständiger Export/Import), keine Logik beim Anbieter
- Repo-Zugang und Fly-/Resend-Zugangsdaten an einem für die Stellvertretung dokumentierten Ort hinterlegen

## 12. Etappenplan

| Etappe | Inhalt | Abnahme |
|---|---|---|
| **E1** | Prisma-Schema, Seed mit Beispieldaten, Leseransichten (Was ist neu, Übersicht, Detail) im Zieldesign | Design-Review durch Beat anhand Beispieldaten |
| **E2** | Admin-Bereich: Projekte und Updates CRUD, Entwurf/Publizieren, Archivierung | Vitest gegen lib/domain (R2, R3, R5, R6) |
| **E3** | Auth: Login, Rollen, Benutzerverwaltung, Passwortwechselzwang, Rate Limiting | Vitest (R1, R9), manueller Test Leser vs. Admin |
| **E4** | Deployment fly.io, Volume, Snapshots, JSON-Export/Import | Testbetrieb mit 2 bis 3 echten Projekten, Export-Restore-Probe (R7) |
| **E5** | Mailversand Resend inkl. Domainverifizierung, MAILVERSAND-Protokoll | Testversand an Beat, dann Pilotkreis (R8) |
| **E6** | Exporte für Berichte: PDF pro Projekt / Gesamtübersicht (Playwright-Pipeline) | verwendbar im Monatsbericht |
| **E7** | Umzug interner Server | Betrieb intern, BETRIEB.md aktualisiert |

## 13. Offene Punkte

- **K1: Absenderdomain für Resend.** Wer verwaltet die DNS-Zone altdorf.ch, und kann eine Subdomain mit SPF/DKIM-Einträgen eingerichtet werden? Abklärung parallel zur Entwicklung, blockiert E1 bis E4 nicht.
- **K2: Trigger-Modus Mail.** Sofort bei Publikation, Wochendigest oder manuell ausgelöst per Knopf. Entscheid vor E5, Empfehlung: manuell ausgelöst (Kontrolle, keine Mail-Müdigkeit).
- **K3: Zeitpunkt Etappe B.** Abhängig von Ferienabwesenheiten und Wechsel Leitung IT. Bis dahin gilt R4 strikt.
- **K4: Leserkreis.** Wer genau erhält ein Konto: Abteilungsleitungen, Gemeindeschreiber, Gemeinderat, einzelne Sachbearbeitende? Liste vor E3 festlegen.

---

*Änderungsnachweis: 0.1 vom 07.07.2026, Erstfassung.*
