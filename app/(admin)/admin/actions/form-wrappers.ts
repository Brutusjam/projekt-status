"use server";

import {
  archiveProjectAction,
  deleteProjectAction,
  unarchiveProjectAction,
} from "@/app/(admin)/admin/actions/projects";
import {
  deleteUpdateAction,
  publishUpdateAction,
  removeUpdatePdfAction,
} from "@/app/(admin)/admin/actions/updates";
import {
  activateUserAction,
  deactivateUserAction,
  deleteUserAction,
  toggleMailAboAction,
} from "@/app/(admin)/admin/actions/users";
import { sendMailNotificationAction } from "@/app/(admin)/admin/actions/export-mail";

export async function archiveProjectFormAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  await archiveProjectAction(projectId);
}

export async function unarchiveProjectFormAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  await unarchiveProjectAction(projectId);
}

export async function deleteProjectFormAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  await deleteProjectAction(projectId);
}

export async function publishUpdateFormAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  const updateId = Number(formData.get("updateId"));
  await publishUpdateAction(projectId, updateId);
}

export async function deleteUpdateFormAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  const updateId = Number(formData.get("updateId"));
  await deleteUpdateAction(projectId, updateId);
}

export async function removeUpdatePdfFormAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  const updateId = Number(formData.get("updateId"));
  await removeUpdatePdfAction(projectId, updateId);
}

export async function sendMailFormAction(formData: FormData) {
  const projectId = Number(formData.get("projectId"));
  const updateId = Number(formData.get("updateId"));
  await sendMailNotificationAction(projectId, updateId);
}

export async function deactivateUserFormAction(formData: FormData) {
  const userId = Number(formData.get("userId"));
  await deactivateUserAction(userId);
}

export async function activateUserFormAction(formData: FormData) {
  const userId = Number(formData.get("userId"));
  await activateUserAction(userId);
}

export async function toggleMailAboFormAction(formData: FormData) {
  const userId = Number(formData.get("userId"));
  const mailAbo = formData.get("mailAbo") === "true";
  await toggleMailAboAction(userId, mailAbo);
}

export async function deleteUserFormAction(formData: FormData) {
  const userId = Number(formData.get("userId"));
  await deleteUserAction(userId);
}
