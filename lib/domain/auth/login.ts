import type { PrismaClient } from "@/app/generated/prisma/client";
import {
  checkLoginAllowed,
  recordLoginFailure,
  resetLoginAttempts,
} from "@/lib/domain/auth/rate-limit";
import { verifyPassword } from "@/lib/auth/password";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  rolle: "ADMIN" | "LESER";
  mustChangePassword: boolean;
};

export async function verifyCredentials(
  db: PrismaClient,
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const lockStatus = checkLoginAllowed(normalizedEmail);
  if (!lockStatus.allowed) {
    return {
      user: null,
      error: "Zu viele Fehlversuche. Bitte versuche es später erneut.",
    };
  }

  const user = await db.benutzer.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.aktiv) {
    recordLoginFailure(normalizedEmail);
    return { user: null, error: "Ungültige Anmeldedaten." };
  }

  const valid = await verifyPassword(password, user.passwortHash);
  if (!valid) {
    const result = recordLoginFailure(normalizedEmail);
    if (result.locked) {
      return {
        user: null,
        error: "Zu viele Fehlversuche. Bitte versuche es später erneut.",
      };
    }
    return { user: null, error: "Ungültige Anmeldedaten." };
  }

  resetLoginAttempts(normalizedEmail);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      rolle: user.rolle,
      mustChangePassword: user.mustChangePassword,
    },
  };
}
