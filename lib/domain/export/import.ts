import type { PrismaClient } from "@/app/generated/prisma/client";
import { ValidationError } from "@/lib/domain/errors";
import {
  SUPPORTED_EXPORT_VERSIONS,
  type ExportBundle,
} from "@/lib/domain/export/types";
import {
  deletePdfFileIfPresent,
  writePdfFromBase64,
} from "@/lib/domain/updates/attachments";

function parseDate(value: string): Date {
  return new Date(value);
}

export function parseExportJson(raw: string): ExportBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError("Ungültiges JSON-Format.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("version" in parsed) ||
    !("benutzer" in parsed) ||
    !("projekte" in parsed)
  ) {
    throw new ValidationError("Export-Format unvollständig.");
  }

  const bundle = parsed as ExportBundle;

  if (
    !SUPPORTED_EXPORT_VERSIONS.includes(
      bundle.version as (typeof SUPPORTED_EXPORT_VERSIONS)[number],
    )
  ) {
    throw new ValidationError(
      `Unsupported export version: ${bundle.version}`,
    );
  }

  return bundle;
}

export async function importDatabase(
  db: PrismaClient,
  bundle: ExportBundle,
): Promise<void> {
  const previousUpdates = await db.update.findMany({
    select: { id: true },
  });
  for (const update of previousUpdates) {
    deletePdfFileIfPresent(update.id);
  }

  await db.$transaction(async (tx) => {
    await tx.mailversand.deleteMany();
    await tx.update.deleteMany();
    await tx.projekt.deleteMany();
    await tx.benutzer.deleteMany();

    for (const b of bundle.benutzer) {
      await tx.benutzer.create({
        data: {
          id: b.id,
          name: b.name,
          email: b.email,
          rolle: b.rolle as "ADMIN" | "LESER",
          passwortHash: b.passwortHash,
          mustChangePassword: b.mustChangePassword,
          mailAbo: b.mailAbo,
          aktiv: b.aktiv,
          createdAt: parseDate(b.createdAt),
          updatedAt: parseDate(b.updatedAt),
        },
      });
    }

    for (const p of bundle.projekte) {
      await tx.projekt.create({
        data: {
          id: p.id,
          titel: p.titel,
          abteilung: p.abteilung,
          ansprechperson: p.ansprechperson,
          status: p.status as never,
          startdatum: parseDate(p.startdatum),
          naechsterTermin: p.naechsterTermin
            ? parseDate(p.naechsterTermin)
            : null,
          naechsterTerminLabel: p.naechsterTerminLabel,
          kurzbeschrieb: p.kurzbeschrieb,
          wirkung: p.wirkung,
          archiviert: p.archiviert,
          createdAt: parseDate(p.createdAt),
          updatedAt: parseDate(p.updatedAt),
        },
      });

      for (const u of p.updates) {
        await tx.update.create({
          data: {
            id: u.id,
            projektId: u.projektId,
            datum: parseDate(u.datum),
            kurztitel: u.kurztitel,
            detailtext: u.detailtext,
            status: u.status as "ENTWURF" | "PUBLIZIERT",
            publiziertAm: u.publiziertAm ? parseDate(u.publiziertAm) : null,
            createdAt: parseDate(u.createdAt),
            pdfDateiname: u.pdfDateiname ?? null,
            pdfMimeType: u.pdfMimeType ?? null,
            pdfGroesse: u.pdfGroesse ?? null,
            pdfGespeichertAm: u.pdfGespeichertAm
              ? parseDate(u.pdfGespeichertAm)
              : null,
          },
        });
      }
    }

    for (const m of bundle.mailversand ?? []) {
      await tx.mailversand.create({
        data: {
          id: m.id,
          updateId: m.updateId,
          empfaenger: m.empfaenger,
          gesendetAm: parseDate(m.gesendetAm),
          status: m.status as "GESENDET" | "FEHLGESCHLAGEN",
        },
      });
    }
  });

  for (const p of bundle.projekte) {
    for (const u of p.updates) {
      if (u.pdfBase64) {
        writePdfFromBase64(u.id, u.pdfBase64);
      }
    }
  }
}
