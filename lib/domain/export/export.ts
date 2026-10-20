import type { PrismaClient } from "@/app/generated/prisma/client";
import { EXPORT_VERSION, type ExportBundle } from "@/lib/domain/export/types";
import { readPdfFile } from "@/lib/domain/updates/attachments";

function toIso(date: Date): string {
  return date.toISOString();
}

export async function exportDatabase(db: PrismaClient): Promise<ExportBundle> {
  const [benutzer, projekte, mailversand] = await Promise.all([
    db.benutzer.findMany({ orderBy: { id: "asc" } }),
    db.projekt.findMany({
      include: { updates: { orderBy: { id: "asc" } } },
      orderBy: { id: "asc" },
    }),
    db.mailversand.findMany({ orderBy: { id: "asc" } }),
  ]);

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    benutzer: benutzer.map((b) => ({
      id: b.id,
      name: b.name,
      email: b.email,
      rolle: b.rolle,
      passwortHash: b.passwortHash,
      mustChangePassword: b.mustChangePassword,
      mailAbo: b.mailAbo,
      aktiv: b.aktiv,
      createdAt: toIso(b.createdAt),
      updatedAt: toIso(b.updatedAt),
    })),
    projekte: projekte.map((p) => ({
      id: p.id,
      titel: p.titel,
      abteilung: p.abteilung,
      ansprechperson: p.ansprechperson,
      status: p.status,
      startdatum: toIso(p.startdatum),
      naechsterTermin: p.naechsterTermin ? toIso(p.naechsterTermin) : null,
      naechsterTerminLabel: p.naechsterTerminLabel,
      kurzbeschrieb: p.kurzbeschrieb,
      wirkung: p.wirkung,
      archiviert: p.archiviert,
      createdAt: toIso(p.createdAt),
      updatedAt: toIso(p.updatedAt),
      updates: p.updates.map((u) => {
        const pdfBuffer =
          u.pdfDateiname && u.pdfGroesse ? readPdfFile(u.id) : null;
        return {
          id: u.id,
          projektId: u.projektId,
          datum: toIso(u.datum),
          kurztitel: u.kurztitel,
          detailtext: u.detailtext,
          status: u.status,
          publiziertAm: u.publiziertAm ? toIso(u.publiziertAm) : null,
          createdAt: toIso(u.createdAt),
          pdfDateiname: u.pdfDateiname,
          pdfMimeType: u.pdfMimeType,
          pdfGroesse: u.pdfGroesse,
          pdfGespeichertAm: u.pdfGespeichertAm
            ? toIso(u.pdfGespeichertAm)
            : null,
          pdfBase64: pdfBuffer ? pdfBuffer.toString("base64") : null,
        };
      }),
    })),
    mailversand: mailversand.map((m) => ({
      id: m.id,
      updateId: m.updateId,
      empfaenger: m.empfaenger,
      gesendetAm: toIso(m.gesendetAm),
      status: m.status,
    })),
  };
}

export function serializeExport(bundle: ExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}
