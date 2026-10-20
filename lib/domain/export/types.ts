export const EXPORT_VERSION = 2;
export const SUPPORTED_EXPORT_VERSIONS = [1, 2] as const;

export type ExportUpdate = {
  id: number;
  projektId: number;
  datum: string;
  kurztitel: string;
  detailtext: string;
  status: string;
  publiziertAm: string | null;
  createdAt: string;
  pdfDateiname?: string | null;
  pdfMimeType?: string | null;
  pdfGroesse?: number | null;
  pdfGespeichertAm?: string | null;
  pdfBase64?: string | null;
};

export type ExportBundle = {
  version: number;
  exportedAt: string;
  benutzer: Array<{
    id: number;
    name: string;
    email: string;
    rolle: string;
    passwortHash: string;
    mustChangePassword: boolean;
    mailAbo: boolean;
    aktiv: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  projekte: Array<{
    id: number;
    titel: string;
    abteilung: string;
    ansprechperson: string;
    status: string;
    startdatum: string;
    naechsterTermin: string | null;
    naechsterTerminLabel: string | null;
    kurzbeschrieb: string;
    wirkung: string;
    archiviert: boolean;
    createdAt: string;
    updatedAt: string;
    updates: ExportUpdate[];
  }>;
  mailversand: Array<{
    id: number;
    updateId: number;
    empfaenger: string;
    gesendetAm: string;
    status: string;
  }>;
};
