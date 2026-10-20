import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createTestPrismaClient, destroyTestDatabase } from "../helpers/test-db";
import { NotFoundError, ValidationError } from "@/lib/domain/errors";
import { deleteUser } from "@/lib/domain/users/mutations";

describe("deleteUser", () => {
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

  async function createBenutzer(data: {
    name: string;
    email: string;
    rolle: "ADMIN" | "LESER";
    aktiv?: boolean;
  }) {
    return db.benutzer.create({
      data: {
        name: data.name,
        email: data.email,
        rolle: data.rolle,
        passwortHash: "hash",
        mustChangePassword: false,
        mailAbo: data.rolle === "LESER",
        aktiv: data.aktiv ?? true,
      },
    });
  }

  it("löscht einen Leser erfolgreich", async () => {
    await createBenutzer({
      name: "Admin",
      email: "admin@test.local",
      rolle: "ADMIN",
    });
    const leser = await createBenutzer({
      name: "Leser",
      email: "leser@test.local",
      rolle: "LESER",
    });

    await deleteUser(db, leser.id);

    expect(await db.benutzer.findUnique({ where: { id: leser.id } })).toBeNull();
  });

  it("blockiert Löschen des letzten aktiven Admins", async () => {
    const admin = await createBenutzer({
      name: "Admin",
      email: "admin@test.local",
      rolle: "ADMIN",
    });

    await expect(deleteUser(db, admin.id)).rejects.toThrow(ValidationError);
    await expect(deleteUser(db, admin.id)).rejects.toThrow(
      "letzte aktive Admin",
    );
    expect(await db.benutzer.findUnique({ where: { id: admin.id } })).not.toBeNull();
  });

  it("erlaubt Löschen eines Admins wenn ein weiterer aktiv ist", async () => {
    await createBenutzer({
      name: "Admin Eins",
      email: "admin1@test.local",
      rolle: "ADMIN",
    });
    const admin2 = await createBenutzer({
      name: "Admin Zwei",
      email: "admin2@test.local",
      rolle: "ADMIN",
    });

    await deleteUser(db, admin2.id);

    expect(await db.benutzer.findUnique({ where: { id: admin2.id } })).toBeNull();
  });

  it("wirft NotFoundError bei unbekannter ID", async () => {
    await expect(deleteUser(db, 99999)).rejects.toThrow(NotFoundError);
  });
});
