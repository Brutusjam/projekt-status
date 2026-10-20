import type {
  ProjektStatus,
  Rolle,
  UpdateStatus,
} from "@/app/generated/prisma/client";

export const PROJEKT_STATUS_LABELS: Record<ProjektStatus, string> = {
  IDEE: "Idee",
  IN_ABKLAERUNG: "In Abklärung",
  IN_UMSETZUNG: "In Umsetzung",
  PILOTBETRIEB: "Pilotbetrieb",
  ABGESCHLOSSEN: "Abgeschlossen",
  PAUSIERT: "Pausiert",
};

export const UPDATE_STATUS_LABELS: Record<UpdateStatus, string> = {
  ENTWURF: "Entwurf",
  PUBLIZIERT: "Publiziert",
};

export const ROLLE_LABELS: Record<Rolle, string> = {
  ADMIN: "Admin",
  LESER: "Leser",
};

export function getProjektStatusLabel(status: ProjektStatus): string {
  return PROJEKT_STATUS_LABELS[status];
}

export function getRolleLabel(rolle: Rolle): string {
  return ROLLE_LABELS[rolle];
}
