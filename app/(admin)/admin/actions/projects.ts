"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/session";
import { DomainError } from "@/lib/domain/errors";
import {
  archiveProject,
  createProject,
  hardDeleteProject,
  unarchiveProject,
  updateProject,
} from "@/lib/domain/projects/mutations";
import { createProjectSchema, updateProjectSchema } from "@/lib/domain/schemas/project";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  redirectTo?: string;
  success?: string;
};

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

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const parsed = createProjectSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    const project = await createProject(prisma, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    redirect(`/admin/projekte/${project.id}`);
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return handleActionError(error);
  }
}

export async function updateProjectAction(
  projectId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdminSession();
    const parsed = updateProjectSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    await updateProject(prisma, projectId, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/admin/projekte/${projectId}`);
    revalidatePath(`/projekte/${projectId}`);
    return { success: "Änderungen gespeichert." };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function archiveProjectAction(projectId: number) {
  try {
    await requireAdminSession();
    await archiveProject(prisma, projectId);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/admin/projekte/${projectId}`);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function unarchiveProjectAction(projectId: number) {
  try {
    await requireAdminSession();
    await unarchiveProject(prisma, projectId);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(`/admin/projekte/${projectId}`);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProjectAction(projectId: number) {
  try {
    await requireAdminSession();
    await hardDeleteProject(prisma, projectId);
    revalidatePath("/");
    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return handleActionError(error);
  }
}
