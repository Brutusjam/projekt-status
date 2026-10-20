import { auth } from "@/auth";
import { requireAdmin } from "@/lib/domain/authorization";
import { ForbiddenError } from "@/lib/domain/errors";
import type { Rolle } from "@/app/generated/prisma/client";

export async function getSessionRole(): Promise<Rolle | undefined> {
  const session = await auth();
  return session?.user?.rolle;
}

export async function requireAuthenticatedSession() {
  const session = await auth();
  if (!session?.user?.rolle) {
    throw new ForbiddenError("Anmeldung erforderlich");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireAuthenticatedSession();
  if (session.user.mustChangePassword) {
    throw new ForbiddenError("Passwortwechsel erforderlich");
  }
  requireAdmin(session.user.rolle);
  return session;
}

export async function requireReaderSession() {
  const session = await requireAuthenticatedSession();
  if (session.user.mustChangePassword) {
    throw new ForbiddenError("Passwortwechsel erforderlich");
  }
  return session;
}
