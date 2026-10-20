import type { UpdateStatus } from "@/app/generated/prisma/client";

export function isPublished(status: UpdateStatus): boolean {
  return status === "PUBLIZIERT";
}

export function filterPublished<T extends { status: UpdateStatus }>(updates: T[]): T[] {
  return updates.filter((update) => isPublished(update.status));
}

export function projectHasPublishedUpdates(updates: { status: UpdateStatus }[]): boolean {
  return updates.some((update) => isPublished(update.status));
}
