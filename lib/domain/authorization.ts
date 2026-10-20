import type { Rolle } from "@/app/generated/prisma/client";
import { ForbiddenError } from "@/lib/domain/errors";

export function requireAdmin(rolle: Rolle | undefined): void {
  if (rolle !== "ADMIN") {
    throw new ForbiddenError("Admin-Berechtigung erforderlich");
  }
}

export function requireAuthenticated(rolle: Rolle | undefined): void {
  if (!rolle) {
    throw new ForbiddenError("Anmeldung erforderlich");
  }
}
