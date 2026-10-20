"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/session";
import { DomainError } from "@/lib/domain/errors";
import { exportDatabase, serializeExport } from "@/lib/domain/export/export";
import { importDatabase, parseExportJson } from "@/lib/domain/export/import";
import { sendUpdateNotification } from "@/lib/domain/mail/send-notification";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/app/(admin)/admin/actions/projects";

function handleActionError(error: unknown): ActionState {
  if (error instanceof DomainError) {
    return { error: error.message };
  }
  console.error(error);
  return { error: "Ein unerwarteter Fehler ist aufgetreten." };
}

export async function exportDatabaseAction(): Promise<string> {
  await requireAdminSession();
  const bundle = await exportDatabase(prisma);
  return serializeExport(bundle);
}

export async function importDatabaseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const content = formData.get("content") as string;
    if (!content?.trim()) {
      return { error: "Keine Importdaten vorhanden." };
    }

    const bundle = parseExportJson(content);
    await importDatabase(prisma, bundle);
    revalidatePath("/", "layout");
    return { success: "Import erfolgreich abgeschlossen." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function sendMailNotificationAction(
  projectId: number,
  updateId: number,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const baseUrl =
      process.env.NEXTAUTH_URL ??
      process.env.APP_URL ??
      "http://localhost:3000";
    const result = await sendUpdateNotification(
      prisma,
      updateId,
      baseUrl,
    );
    revalidatePath(`/admin/projekte/${projectId}`);
    revalidatePath(`/admin/projekte/${projectId}/updates`);

    if (result.skipped) {
      return { success: result.message ?? "Kein Versand." };
    }

    return {
      success: `Versand abgeschlossen: ${result.sent} gesendet, ${result.failed} fehlgeschlagen.`,
    };
  } catch (error) {
    return handleActionError(error);
  }
}
