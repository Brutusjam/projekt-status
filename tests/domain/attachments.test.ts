import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createTestPrismaClient, destroyTestDatabase } from "../helpers/test-db";
import { createProject } from "@/lib/domain/projects/mutations";
import {
  attachPdf,
  getUpdatePdfPath,
  MAX_PDF_BYTES,
  removePdf,
  validatePdfBuffer,
} from "@/lib/domain/updates/attachments";
import {
  createUpdate,
  hardDeleteUpdate,
} from "@/lib/domain/updates/mutations";
import { ValidationError } from "@/lib/domain/errors";

function minimalPdf(content = "test"): Buffer {
  return Buffer.from(`%PDF-1.4\n${content}\n%%EOF\n`);
}

describe("PDF attachments", () => {
  let db: ReturnType<typeof createTestPrismaClient>["client"];
  let testDbPath: string;
  let uploadDir: string;
  let previousUploadDir: string | undefined;

  beforeEach(() => {
    const setup = createTestPrismaClient();
    db = setup.client;
    testDbPath = setup.testDbPath;
    uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "projekt-uploads-"));
    previousUploadDir = process.env.UPLOAD_DIR;
    process.env.UPLOAD_DIR = uploadDir;
  });

  afterEach(async () => {
    await destroyTestDatabase(db, testDbPath);
    if (previousUploadDir === undefined) {
      delete process.env.UPLOAD_DIR;
    } else {
      process.env.UPLOAD_DIR = previousUploadDir;
    }
    fs.rmSync(uploadDir, { recursive: true, force: true });
  });

  async function seedUpdate() {
    const project = await createProject(db, {
      titel: "Anhang Test",
      abteilung: "Kanzlei",
      ansprechperson: "GS",
      status: "IN_UMSETZUNG",
      startdatum: new Date("2026-01-15T12:00:00.000Z"),
      naechsterTermin: null,
      naechsterTerminLabel: null,
      kurzbeschrieb: "Kurz",
      wirkung: "Wirkung",
    });
    const update = await createUpdate(db, project.id, {
      datum: new Date("2026-02-01T12:00:00.000Z"),
      kurztitel: "Update",
      detailtext: "Detail",
    });
    return { project, update };
  }

  it("lehnt ungültige Dateien ab", () => {
    expect(() => validatePdfBuffer(Buffer.from("not-pdf"), "text/plain")).toThrow(
      ValidationError,
    );
    expect(() =>
      validatePdfBuffer(Buffer.alloc(MAX_PDF_BYTES + 1, 0x25), "application/pdf"),
    ).toThrow(ValidationError);
  });

  it("hängt PDF an und speichert Metadaten sowie Datei", async () => {
    const { update } = await seedUpdate();
    const buffer = minimalPdf("hello");

    const updated = await attachPdf(db, update.id, {
      buffer,
      originalFilename: "bericht.pdf",
      mimeType: "application/pdf",
    });

    expect(updated.pdfDateiname).toBe("bericht.pdf");
    expect(updated.pdfGroesse).toBe(buffer.length);
    expect(fs.existsSync(getUpdatePdfPath(update.id))).toBe(true);
  });

  it("entfernt PDF und räumt beim Löschen des Entwurfs auf", async () => {
    const { update } = await seedUpdate();
    await attachPdf(db, update.id, {
      buffer: minimalPdf(),
      originalFilename: "x.pdf",
      mimeType: "application/pdf",
    });

    await removePdf(db, update.id);
    const cleared = await db.update.findUnique({ where: { id: update.id } });
    expect(cleared?.pdfDateiname).toBeNull();
    expect(fs.existsSync(getUpdatePdfPath(update.id))).toBe(false);

    await attachPdf(db, update.id, {
      buffer: minimalPdf("again"),
      originalFilename: "y.pdf",
      mimeType: "application/pdf",
    });
    await hardDeleteUpdate(db, update.id);
    expect(fs.existsSync(getUpdatePdfPath(update.id))).toBe(false);
  });
});
