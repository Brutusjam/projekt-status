import "dotenv/config";
import {
  ProjektStatus,
  Rolle,
  UpdateStatus,
} from "../app/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";
import { createPrismaClient } from "../lib/db";

const prisma = createPrismaClient();

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

async function main() {
  await prisma.mailversand.deleteMany();
  await prisma.update.deleteMany();
  await prisma.projekt.deleteMany();
  await prisma.benutzer.deleteMany();

  const adminPasswordHash = await hashPassword("admin1234");

  await prisma.benutzer.create({
    data: {
      name: "Beat Schuler",
      email: "admin@example.local",
      rolle: Rolle.ADMIN,
      passwortHash: adminPasswordHash,
      mustChangePassword: true,
      mailAbo: true,
      aktiv: true,
    },
  });

  const leserPasswordHash = await hashPassword("leser1234");

  await prisma.benutzer.create({
    data: {
      name: "Leser Demo",
      email: "leser@example.local",
      rolle: Rolle.LESER,
      passwortHash: leserPasswordHash,
      mustChangePassword: true,
      mailAbo: true,
      aktiv: true,
    },
  });

  const _digitaleKanzlei = await prisma.projekt.create({
    data: {
      titel: "Digitale Kanzlei",
      abteilung: "Kanzlei",
      ansprechperson: "GS",
      status: ProjektStatus.IN_UMSETZUNG,
      startdatum: daysAgo(120),
      naechsterTermin: daysFromNow(14),
      naechsterTerminLabel: "Review mit Abteilungsleitungen",
      kurzbeschrieb:
        "Vereinheitlichung der internen Abläufe in der Kanzlei. Fokus auf digitale Aktenführung und standardisierte Vorlagen.",
      wirkung:
        "Weniger Medienbrüche, schnellere Bearbeitung von Standardgeschäften und bessere Nachvollziehbarkeit für Stellvertretungen.",
      archiviert: false,
      updates: {
        create: [
          {
            datum: daysAgo(45),
            kurztitel: "Prozesslandkarte erstellt",
            detailtext:
              "Die wichtigsten Kernprozesse sind erfasst.\n\nNächster Schritt: Abstimmung mit den Teamleitungen.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(44),
            createdAt: daysAgo(45),
          },
          {
            datum: daysAgo(10),
            kurztitel: "Pilot für Vorlagen gestartet",
            detailtext:
              "**Pilotphase** mit drei Standardgeschäften.\n\nFeedback wird bis Ende Monat gesammelt.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(9),
            createdAt: daysAgo(10),
          },
          {
            datum: daysAgo(2),
            kurztitel: "Entwurf Schulungskonzept",
            detailtext: "Interner Entwurf, noch nicht publiziert.",
            status: UpdateStatus.ENTWURF,
            createdAt: daysAgo(2),
          },
        ],
      },
    },
  });

  const _finanzcontrolling = await prisma.projekt.create({
    data: {
      titel: "Finanzcontrolling Dashboard",
      abteilung: "Finanzen",
      ansprechperson: "FI",
      status: ProjektStatus.IN_ABKLAERUNG,
      startdatum: daysAgo(60),
      naechsterTermin: daysFromNow(21),
      naechsterTerminLabel: "Workshop Kennzahlen",
      kurzbeschrieb:
        "Abklärung eines übersichtlichen Dashboards für Budget und Prognosewerte auf Abteilungsebene.",
      wirkung:
        "Frühzeitige Abweichungen werden sichtbar, Entscheidungen können schneller vorbereitet werden.",
      archiviert: false,
      updates: {
        create: [
          {
            datum: daysAgo(30),
            kurztitel: "Anforderungen gesammelt",
            detailtext:
              "Erste Rückmeldungen aus Finanzen und Kanzlei liegen vor.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(29),
            createdAt: daysAgo(30),
          },
          {
            datum: daysAgo(5),
            kurztitel: "Datenquellen geprüft",
            detailtext:
              "Technische Machbarkeit der wichtigsten Kennzahlen ist grundsätzlich gegeben.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(4),
            createdAt: daysAgo(5),
          },
        ],
      },
    },
  });

  const _bauprozess = await prisma.projekt.create({
    data: {
      titel: "Bauprozess Nachführung",
      abteilung: "Bau",
      ansprechperson: "BA",
      status: ProjektStatus.PILOTBETRIEB,
      startdatum: daysAgo(200),
      naechsterTermin: daysFromNow(7),
      naechsterTerminLabel: "Pilot-Review",
      kurzbeschrieb:
        "Überarbeitung des Bauprozesses für Standardvorhaben mit klarer Rollenverteilung.",
      wirkung:
        "Kürzere Durchlaufzeiten und einheitliche Kommunikation mit Bewilligungsbehörden.",
      archiviert: false,
      updates: {
        create: [
          {
            datum: daysAgo(20),
            kurztitel: "Pilot in zwei Teams",
            detailtext: "Zwei Teams arbeiten nach dem neuen Ablauf.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(19),
            createdAt: daysAgo(20),
          },
        ],
      },
    },
  });

  await prisma.projekt.create({
    data: {
      titel: "EWK Schulungsprogramm",
      abteilung: "EWK",
      ansprechperson: "EW",
      status: ProjektStatus.IDEE,
      startdatum: daysAgo(14),
      kurzbeschrieb:
        "Idee für ein modular aufgebautes Schulungsprogramm für neue Mitarbeitende.",
      wirkung:
        "Schnellere Einarbeitung und weniger Rückfragen an erfahrene Kolleginnen und Kollegen.",
      archiviert: false,
      updates: {
        create: [
          {
            datum: daysAgo(7),
            kurztitel: "Erste Skizze",
            detailtext: "Interner Entwurf.",
            status: UpdateStatus.ENTWURF,
            createdAt: daysAgo(7),
          },
        ],
      },
    },
  });

  await prisma.projekt.create({
    data: {
      titel: "Projekt ohne Publikation",
      abteilung: "übergreifend",
      ansprechperson: "PV",
      status: ProjektStatus.IN_ABKLAERUNG,
      startdatum: daysAgo(30),
      kurzbeschrieb:
        "Testprojekt ohne publizierte Updates. Soll in Leseransichten unsichtbar sein.",
      wirkung: "Nur für interne Tests.",
      archiviert: false,
      updates: {
        create: [
          {
            datum: daysAgo(3),
            kurztitel: "Interner Entwurf",
            detailtext: "Noch nicht freigegeben.",
            status: UpdateStatus.ENTWURF,
            createdAt: daysAgo(3),
          },
        ],
      },
    },
  });

  await prisma.projekt.create({
    data: {
      titel: "Telefonie Migration",
      abteilung: "übergreifend",
      ansprechperson: "IT",
      status: ProjektStatus.ABGESCHLOSSEN,
      startdatum: daysAgo(400),
      kurzbeschrieb: "Migration der Telefonanlage auf VoIP.",
      wirkung: "Stabilere Erreichbarkeit und einfachere Erweiterbarkeit.",
      archiviert: true,
      updates: {
        create: [
          {
            datum: daysAgo(180),
            kurztitel: "Migration abgeschlossen",
            detailtext: "Alle Standorte sind umgestellt.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(179),
            createdAt: daysAgo(180),
          },
        ],
      },
    },
  });

  await prisma.projekt.create({
    data: {
      titel: "Onboarding Checkliste",
      abteilung: "Kanzlei",
      ansprechperson: "HR",
      status: ProjektStatus.PAUSIERT,
      startdatum: daysAgo(90),
      kurzbeschrieb:
        "Einheitliche Checkliste für das Onboarding neuer Mitarbeitender.",
      wirkung: "Weniger Vergesslichkeit in den ersten Wochen.",
      archiviert: false,
      updates: {
        create: [
          {
            datum: daysAgo(40),
            kurztitel: "Vorlage getestet",
            detailtext: "Pilot in einer Abteilung abgeschlossen.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(39),
            createdAt: daysAgo(40),
          },
          {
            datum: daysAgo(40),
            kurztitel: "Zweites Update am selben Tag",
            detailtext:
              "Testfall für Timeline-Sortierung bei gleichem Datum.",
            status: UpdateStatus.PUBLIZIERT,
            publiziertAm: daysAgo(39),
            createdAt: daysAgo(39),
          },
        ],
      },
    },
  });

  console.log("Seed abgeschlossen.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
