import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  filterPublished,
  projectHasPublishedUpdates,
} from "@/lib/domain/visibility";
import { createTestPrismaClient, destroyTestDatabase } from "../helpers/test-db";
import {
  getProjectDetail,
  listVisibleProjects,
} from "@/lib/domain/projects/queries";

describe("visibility", () => {
  it("filterPublished blendet Entwürfe aus", () => {
    const updates = [
      { status: "ENTWURF" as const },
      { status: "PUBLIZIERT" as const },
    ];

    expect(filterPublished(updates)).toEqual([{ status: "PUBLIZIERT" }]);
  });

  it("projectHasPublishedUpdates erkennt Timeline-Inhalt", () => {
    expect(
      projectHasPublishedUpdates([{ status: "ENTWURF" }]),
    ).toBe(false);
    expect(
      projectHasPublishedUpdates([
        { status: "ENTWURF" },
        { status: "PUBLIZIERT" },
      ]),
    ).toBe(true);
  });
});

describe("Projektübersicht ohne Publikationspflicht", () => {
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

  it("listet aktive Projekte auch ohne Updates", async () => {
    await db.projekt.create({
      data: {
        titel: "Ohne Update",
        abteilung: "Kanzlei",
        ansprechperson: "GS",
        status: "IDEE",
        startdatum: new Date("2026-01-01T12:00:00.000Z"),
        kurzbeschrieb: "Kurz",
        wirkung: "Wirkung",
      },
    });

    const list = await listVisibleProjects(db);
    expect(list).toHaveLength(1);
    expect(list[0]?.titel).toBe("Ohne Update");

    const detail = await getProjectDetail(db, list[0]!.id);
    expect(detail).not.toBeNull();
    expect(detail?.updates).toEqual([]);
  });
});
