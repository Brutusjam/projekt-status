import { z } from "zod";

const projektStatusEnum = z.enum([
  "IDEE",
  "IN_ABKLAERUNG",
  "IN_UMSETZUNG",
  "PILOTBETRIEB",
  "ABGESCHLOSSEN",
  "PAUSIERT",
]);

function parseDateInput(value: string): Date {
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Ungültiges Datum");
  }
  return date;
}

const dateField = z
  .string()
  .min(1, "Datum erforderlich")
  .transform(parseDateInput);

const optionalDateField = z
  .string()
  .optional()
  .transform((value) => {
    if (!value || value.trim() === "") {
      return null;
    }
    return parseDateInput(value);
  });

export const createProjectSchema = z.object({
  titel: z.string().trim().min(1, "Titel erforderlich").max(200),
  abteilung: z.string().trim().min(1, "Abteilung erforderlich").max(100),
  ansprechperson: z.string().trim().min(1, "Ansprechperson erforderlich").max(50),
  status: projektStatusEnum,
  startdatum: dateField,
  naechsterTermin: optionalDateField,
  naechsterTerminLabel: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  kurzbeschrieb: z.string().trim().min(1, "Kurzbeschrieb erforderlich").max(2000),
  wirkung: z.string().trim().min(1, "Wirkung erforderlich").max(2000),
});

export const updateProjectSchema = createProjectSchema;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
