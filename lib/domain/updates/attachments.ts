import fs from "node:fs";
import path from "node:path";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { NotFoundError, ValidationError } from "@/lib/domain/errors";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const PDF_MIME = "application/pdf";

export type PdfAttachmentMeta = {
  pdfDateiname: string | null;
  pdfMimeType: string | null;
  pdfGroesse: number | null;
  pdfGespeichertAm: Date | null;
};

export function getUploadRoot(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) {
    return path.resolve(configured);
  }
  return path.resolve(process.cwd(), "data", "uploads");
}

export function getUpdatePdfPath(updateId: number): string {
  return path.join(getUploadRoot(), "updates", `${updateId}.pdf`);
}

function ensureUploadDirs(): void {
  const dir = path.join(getUploadRoot(), "updates");
  fs.mkdirSync(dir, { recursive: true });
}

export function sanitizePdfFilename(original: string): string {
  const base = path.basename(original).replace(/[^a-zA-Z0-9._\- ()]+/g, "_");
  const trimmed = base.trim() || "anhang.pdf";
  return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`;
}

export function validatePdfBuffer(
  buffer: Buffer,
  mimeType: string | null | undefined,
): void {
  if (buffer.length === 0) {
    throw new ValidationError("Die PDF-Datei ist leer.");
  }
  if (buffer.length > MAX_PDF_BYTES) {
    throw new ValidationError(
      "Die PDF-Datei darf höchstens 10 MB gross sein.",
    );
  }
  const mime = (mimeType ?? "").toLowerCase();
  if (mime && mime !== PDF_MIME && mime !== "application/x-pdf") {
    throw new ValidationError("Nur PDF-Dateien sind erlaubt.");
  }
  if (!buffer.subarray(0, 4).equals(Buffer.from("%PDF"))) {
    throw new ValidationError("Die Datei ist kein gültiges PDF.");
  }
}

function deletePdfFile(updateId: number): void {
  const filePath = getUpdatePdfPath(updateId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function attachPdf(
  db: PrismaClient,
  updateId: number,
  input: {
    buffer: Buffer;
    originalFilename: string;
    mimeType?: string | null;
  },
) {
  const existing = await db.update.findUnique({ where: { id: updateId } });
  if (!existing) {
    throw new NotFoundError("Update nicht gefunden");
  }

  validatePdfBuffer(input.buffer, input.mimeType);
  const pdfDateiname = sanitizePdfFilename(input.originalFilename);

  ensureUploadDirs();
  fs.writeFileSync(getUpdatePdfPath(updateId), input.buffer);

  return db.update.update({
    where: { id: updateId },
    data: {
      pdfDateiname,
      pdfMimeType: PDF_MIME,
      pdfGroesse: input.buffer.length,
      pdfGespeichertAm: new Date(),
    },
  });
}

export async function removePdf(db: PrismaClient, updateId: number) {
  const existing = await db.update.findUnique({ where: { id: updateId } });
  if (!existing) {
    throw new NotFoundError("Update nicht gefunden");
  }

  deletePdfFile(updateId);

  return db.update.update({
    where: { id: updateId },
    data: {
      pdfDateiname: null,
      pdfMimeType: null,
      pdfGroesse: null,
      pdfGespeichertAm: null,
    },
  });
}

/** Löscht nur die Datei (z.B. vor hartem DB-Delete). */
export function deletePdfFileIfPresent(updateId: number): void {
  deletePdfFile(updateId);
}

export function readPdfFile(updateId: number): Buffer | null {
  const filePath = getUpdatePdfPath(updateId);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath);
}

export function writePdfFromBase64(
  updateId: number,
  base64: string,
): void {
  const buffer = Buffer.from(base64, "base64");
  validatePdfBuffer(buffer, PDF_MIME);
  ensureUploadDirs();
  fs.writeFileSync(getUpdatePdfPath(updateId), buffer);
}

export function hasPdfAttachment(meta: PdfAttachmentMeta): boolean {
  return Boolean(meta.pdfDateiname && meta.pdfGroesse && meta.pdfMimeType);
}
