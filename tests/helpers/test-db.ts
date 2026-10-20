import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { createPrismaClient } from "@/lib/db";

export function createTestPrismaClient() {
  const testDbPath = path.join(
    os.tmpdir(),
    `projekt-status-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`,
  );

  execSync("npx prisma migrate deploy", {
    env: {
      ...process.env,
      DATABASE_URL: `file:${testDbPath}`,
    },
    stdio: "pipe",
  });

  const previousUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = `file:${testDbPath}`;
  const client = createPrismaClient();
  process.env.DATABASE_URL = previousUrl;

  return { client, testDbPath };
}

export async function destroyTestDatabase(
  client: ReturnType<typeof createPrismaClient>,
  testDbPath: string,
) {
  await client.$disconnect();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}
