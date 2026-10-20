import type { Projekt, ProjektStatus, Update, UpdateStatus } from "@/app/generated/prisma/client";

export type TimelineUpdate = Pick<
  Update,
  | "id"
  | "projektId"
  | "datum"
  | "kurztitel"
  | "detailtext"
  | "status"
  | "createdAt"
  | "pdfDateiname"
  | "pdfMimeType"
  | "pdfGroesse"
  | "pdfGespeichertAm"
>;

export type ProjectSummary = Pick<
  Projekt,
  | "id"
  | "titel"
  | "abteilung"
  | "ansprechperson"
  | "status"
  | "naechsterTermin"
  | "naechsterTerminLabel"
  | "kurzbeschrieb"
  | "wirkung"
  | "archiviert"
  | "startdatum"
> & {
  letztesUpdate: {
    datum: Date;
    kurztitel: string;
  } | null;
};

export type FeedItem = TimelineUpdate & {
  projekt: Pick<Projekt, "id" | "titel" | "abteilung">;
};

export type ProjectDetail = ProjectSummary & {
  updates: TimelineUpdate[];
};

export type ProjectDetailPreview = ProjectDetail & {
  visibleToReaders: boolean;
};

export type ProjectFilters = {
  abteilung?: string;
  status?: ProjektStatus;
};

export { type ProjektStatus, type UpdateStatus };
