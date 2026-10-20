import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createTestPrismaClient, destroyTestDatabase } from "../helpers/test-db";
import {
  archiveProject,
  createProject,
  hardDeleteProject,
  updateProject,
} from "@/lib/domain/projects/mutations";
import {
  createUpdate,
  hardDeleteUpdate,
  publishUpdate,
} from "@/lib/domain/updates/mutations";

describe("project mutations", () => {
  let db: ReturnType<typeof createTestPrismaClient>["client"];
  let testDbPath: string;

  beforeEach(() => {
    const setup = createTestPrismaClient();
    db = setup.client;
    testDbPath = setup.testDbPath;
  });

  afterEach(async () => {
    await destroyTestDatabase(db, testDbPath);
  });

  const projectInput = {
    titel: "Testprojekt",
    abteilung: "Kanzlei",
    ansprechperson: "GS",
    status: "IN_UMSETZUNG" as const,
    startdatum: new Date("2026-01-15T12:00:00.000Z"),
    naechsterTermin: null,
    naechsterTerminLabel: null,
    kurzbeschrieb: "Kurz",
    wirkung: "Wirkung",
  };

  it("archiveProject setzt archiviert (R6)", async () => {
    const project = await createProject(db, projectInput);
    await archiveProject(db, project.id);
    const updated = await db.projekt.findUnique({ where: { id: project.id } });
    expect(updated?.archiviert).toBe(true);
  });

  it("updateProject ändert Status explizit (R5)", async () => {
    const project = await createProject(db, projectInput);
    await updateProject(db, project.id, {
      ...projectInput,
      status: "PILOTBETRIEB",
    });
    const updated = await db.projekt.findUnique({ where: { id: project.id } });
    expect(updated?.status).toBe("PILOTBETRIEB");
  });

  it("hardDeleteProject verweigert Löschen bei publizierten Updates (R6)", async () => {
    const project = await createProject(db, projectInput);
    const update = await createUpdate(db, project.id, {
      datum: new Date("2026-02-01T12:00:00.000Z"),
      kurztitel: "Live",
      detailtext: "Text",
    });
    await publishUpdate(db, update.id);

    await expect(hardDeleteProject(db, project.id)).rejects.toThrow(
      "publizierten Updates",
    );
  });

  it("hardDeleteProject erlaubt Löschen ohne publizierte Updates", async () => {
    const project = await createProject(db, projectInput);
    await hardDeleteProject(db, project.id);
    const deleted = await db.projekt.findUnique({ where: { id: project.id } });
    expect(deleted).toBeNull();
  });
});

describe("update mutations", () => {
  let db: ReturnType<typeof createTestPrismaClient>["client"];
  let testDbPath: string;
  let projectId: number;

  beforeEach(async () => {
    const setup = createTestPrismaClient();
    db = setup.client;
    testDbPath = setup.testDbPath;
    const project = await db.projekt.create({
      data: {
        titel: "P",
        abteilung: "Bau",
        ansprechperson: "BA",
        status: "IDEE",
        startdatum: new Date("2026-01-01T12:00:00.000Z"),
        kurzbeschrieb: "K",
        wirkung: "W",
      },
    });
    projectId = project.id;
  });

  afterEach(async () => {
    await destroyTestDatabase(db, testDbPath);
  });

  it("publishUpdate setzt publiziertAm (R2)", async () => {
    const update = await createUpdate(db, projectId, {
      datum: new Date("2026-03-01T12:00:00.000Z"),
      kurztitel: "Update",
      detailtext: "Detail",
    });

    expect(update.status).toBe("ENTWURF");

    const published = await publishUpdate(db, update.id);
    expect(published.status).toBe("PUBLIZIERT");
    expect(published.publiziertAm).not.toBeNull();
  });

  it("hardDeleteUpdate löscht auch publizierte Updates", async () => {
    const update = await createUpdate(db, projectId, {
      datum: new Date("2026-03-01T12:00:00.000Z"),
      kurztitel: "Update",
      detailtext: "Detail",
    });
    await publishUpdate(db, update.id);

    await hardDeleteUpdate(db, update.id);
    const deleted = await db.update.findUnique({ where: { id: update.id } });
    expect(deleted).toBeNull();
  });
});
