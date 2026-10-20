"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut, unstable_update } from "@/auth";
import { verifyPassword } from "@/lib/auth/password";
import { requireAdminSession, requireAuthenticatedSession } from "@/lib/auth/session";
import { DomainError, ValidationError } from "@/lib/domain/errors";
import { changePasswordSchema, createUserSchema } from "@/lib/domain/schemas/user";
import {
  activateUser,
  changeUserPassword,
  createUser,
  deactivateUser,
  deleteUser,
  setMailAbo,
} from "@/lib/domain/users/mutations";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/app/(admin)/admin/actions/projects";
import { z } from "zod";

function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      obj[key] = value;
    }
  }
  return obj;
}

function handleZodError(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { fieldErrors, error: "Bitte prüfe deine Eingaben." };
}

function handleActionError(error: unknown): ActionState {
  if (error instanceof DomainError) {
    return { error: error.message };
  }
  console.error(error);
  return { error: "Ein unerwarteter Fehler ist aufgetreten." };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Ungültige Anmeldedaten oder Konto gesperrt." };
    }

    const user = await prisma.benutzer.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (user?.mustChangePassword) {
      return { redirectTo: "/passwort-aendern" };
    }

    if (user?.rolle === "ADMIN") {
      return {
        redirectTo: callbackUrl.startsWith("/admin") ? callbackUrl : "/admin",
      };
    }

    return { redirectTo: callbackUrl.startsWith("/admin") ? "/" : callbackUrl };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let redirectTo: string | null = null;

  try {
    const session = await requireAuthenticatedSession();
    const parsed = changePasswordSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    const user = await prisma.benutzer.findUnique({
      where: { id: Number(session.user.id) },
    });

    if (!user) {
      return { error: "Benutzer nicht gefunden." };
    }

    const valid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwortHash,
    );

    if (!valid) {
      return { error: "Aktuelles Passwort ist falsch." };
    }

    await changeUserPassword(
      prisma,
      user.id,
      parsed.data.newPassword,
      true,
    );

    // JWT sofort aktualisieren, sonst leitet die Middleware zurück auf
    // /passwort-aendern und erzeugt einen Client-Redirect-Loop.
    await unstable_update({
      user: { mustChangePassword: false },
    });

    redirectTo = session.user.rolle === "ADMIN" ? "/admin" : "/";
  } catch (error) {
    return handleActionError(error);
  }

  if (!redirectTo) {
    return { error: "Weiterleitung fehlgeschlagen." };
  }

  redirect(redirectTo);
}

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const parsed = createUserSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    await createUser(prisma, parsed.data);
    revalidatePath("/admin/benutzer");
    return { success: "Benutzer wurde angelegt." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deactivateUserAction(userId: number) {
  try {
    await requireAdminSession();
    await deactivateUser(prisma, userId);
    revalidatePath("/admin/benutzer");
  } catch (error) {
    return handleActionError(error);
  }
}

export async function activateUserAction(userId: number) {
  try {
    await requireAdminSession();
    await activateUser(prisma, userId);
    revalidatePath("/admin/benutzer");
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleMailAboAction(userId: number, mailAbo: boolean) {
  try {
    await requireAdminSession();
    await setMailAbo(prisma, userId, mailAbo);
    revalidatePath("/admin/benutzer");
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteUserAction(userId: number) {
  try {
    const session = await requireAdminSession();
    if (Number(session.user.id) === userId) {
      throw new ValidationError("Du kannst dein eigenes Konto nicht löschen.");
    }
    await deleteUser(prisma, userId);
    revalidatePath("/admin/benutzer");
  } catch (error) {
    return handleActionError(error);
  }
}
