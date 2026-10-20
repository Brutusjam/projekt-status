"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/session";
import { DomainError } from "@/lib/domain/errors";
import { createUpdateSchema, updateUpdateSchema } from "@/lib/domain/schemas/update";
import {
  attachPdf,
  removePdf,
} from "@/lib/domain/updates/attachments";
import {
  createUpdate,
  hardDeleteUpdate,
  publishUpdate,
  updateUpdate,
} from "@/lib/domain/updates/mutations";
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

function revalidateUpdatePaths(projectId: number) {
  revalidatePath(`/admin/projekte/${projectId}`);
  revalidatePath(`/admin/projekte/${projectId}/updates`);
  revalidatePath(`/projekte/${projectId}`);
  revalidatePath("/was-ist-neu");
  revalidatePath("/");
}

async function readOptionalPdfFromForm(
  formData: FormData,
): Promise<{ buffer: Buffer; originalFilename: string; mimeType: string | null } | null> {
  const file = formData.get("pdf");
  if (!file || !(file instanceof File) || file.size === 0) {
    return null;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    buffer,
    originalFilename: file.name || "anhang.pdf",
    mimeType: file.type || null,
  };
}

export async function createUpdateAction(
  projectId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const parsed = createUpdateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    const created = await createUpdate(prisma, projectId, parsed.data);
    const pdf = await readOptionalPdfFromForm(formData);
    if (pdf) {
      await attachPdf(prisma, created.id, pdf);
    }

    revalidateUpdatePaths(projectId);
    redirect(`/admin/projekte/${projectId}/updates`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Next.js redirect throws a special digest error
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return handleActionError(error);
  }
}

export async function updateUpdateAction(
  projectId: number,
  updateId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const parsed = updateUpdateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    await updateUpdate(prisma, updateId, parsed.data);
    revalidateUpdatePaths(projectId);
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}

export async function attachUpdatePdfAction(
  projectId: number,
  updateId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const pdf = await readOptionalPdfFromForm(formData);
    if (!pdf) {
      return { error: "Bitte wähle eine PDF-Datei aus." };
    }
    await attachPdf(prisma, updateId, pdf);
    revalidateUpdatePaths(projectId);
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeUpdatePdfAction(
  projectId: number,
  updateId: number,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    await removePdf(prisma, updateId);
    revalidateUpdatePaths(projectId);
    return {};
  } catch (error) {
    return handleActionError(error);
  }
}

export async function publishUpdateAction(projectId: number, updateId: number) {
  try {
    await requireAdminSession();
    await publishUpdate(prisma, updateId);
    revalidateUpdatePaths(projectId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteUpdateAction(projectId: number, updateId: number) {
  try {
    await requireAdminSession();
    await hardDeleteUpdate(prisma, updateId);
    revalidateUpdatePaths(projectId);
  } catch (error) {
    return handleActionError(error);
  }
}
