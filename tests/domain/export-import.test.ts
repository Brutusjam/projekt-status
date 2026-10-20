import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createTestPrismaClient, destroyTestDatabase } from "../helpers/test-db";
import { exportDatabase } from "@/lib/domain/export/export";
import { importDatabase, parseExportJson } from "@/lib/domain/export/import";
import { hashPassword } from "@/lib/auth/password";
import {
  attachPdf,
  getUpdatePdfPath,
  readPdfFile,
} from "@/lib/domain/updates/attachments";
import { EXPORT_VERSION } from "@/lib/domain/export/types";

describe("export/import round-trip (R7)", () => {
  let db: ReturnType<typeof createTestPrismaClient>["client"];
  let testDbPath: string;
  let uploadDir: string;
  let previousUploadDir: string | undefined;

  beforeEach(async () => {
    const setup = createTestPrismaClient();
    db = setup.client;
    testDbPath = setup.testDbPath;
    uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), "projekt-export-uploads-"));
    previousUploadDir = process.env.UPLOAD_DIR;
    process.env.UPLOAD_DIR = uploadDir;

    const passwortHash = await hashPassword("testpass");

    await db.benutzer.create({
      data: {
        name: "Admin",
        email: "admin@test.local",
        rolle: "ADMIN",
        passwortHash,
        mustChangePassword: false,
        mailAbo: true,
        aktiv: true,
      },
    });

    const project = await db.projekt.create({
      data: {
        titel: "Export Test",
        abteilung: "Finanzen",
        ansprechperson: "FI",
        status: "IN_ABKLAERUNG",
        startdatum: new Date("2026-01-01T12:00:00.000Z"),
        kurzbeschrieb: "Kurz",
        wirkung: "Wirkung",
      },
    });

    const update = await db.update.create({
      data: {
        projektId: project.id,
        datum: new Date("2026-02-01T12:00:00.000Z"),
        kurztitel: "Update",
        detailtext: "Detail",
        status: "PUBLIZIERT",
        publiziertAm: new Date("2026-02-01T13:00:00.000Z"),
      },
    });

    await attachPdf(db, update.id, {
      buffer: Buffer.from("%PDF-1.4\nexport-test\n%%EOF\n"),
      originalFilename: "export-test.pdf",
      mimeType: "application/pdf",
    });
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

  it("stellt den Zustand nach Import wieder her inkl. PDF", async () => {
    const exported = await exportDatabase(db);
    expect(exported.version).toBe(EXPORT_VERSION);
    expect(exported.projekte[0]?.updates[0]?.pdfBase64).toBeTruthy();

    const json = JSON.stringify(exported);
    const updateId = exported.projekte[0]!.updates[0]!.id;

    await db.mailversand.deleteMany();
    await db.update.deleteMany();
    await db.projekt.deleteMany();
    await db.benutzer.deleteMany();
    fs.unlinkSync(getUpdatePdfPath(updateId));

    expect(await db.projekt.count()).toBe(0);
    expect(fs.existsSync(getUpdatePdfPath(updateId))).toBe(false);

    await importDatabase(db, parseExportJson(json));

    expect(await db.benutzer.count()).toBe(1);
    expect(await db.projekt.count()).toBe(1);
    expect(await db.update.count()).toBe(1);

    const project = await db.projekt.findFirst();
    expect(project?.titel).toBe("Export Test");

    const update = await db.update.findFirst();
    expect(update?.pdfDateiname).toBe("export-test.pdf");
    const restored = readPdfFile(update!.id);
    expect(restored?.toString("utf8")).toContain("export-test");
  });

  it("akzeptiert Export-Version 1 ohne PDF-Felder", async () => {
    const v1 = {
      version: 1,
      exportedAt: new Date().toISOString(),
      benutzer: [
        {
          id: 99,
          name: "V1",
          email: "v1@test.local",
          rolle: "LESER",
          passwortHash: "hash",
          mustChangePassword: false,
          mailAbo: true,
          aktiv: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      projekte: [],
      mailversand: [],
    };

    const parsed = parseExportJson(JSON.stringify(v1));
    await importDatabase(db, parsed);
    expect(await db.benutzer.count()).toBe(1);
    expect(await db.benutzer.findFirst()).toMatchObject({ email: "v1@test.local" });
  });
});
