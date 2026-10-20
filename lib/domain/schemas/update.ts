import { z } from "zod";

function parseDateInput(value: string): Date {
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Ungültiges Datum");
  }
  return date;
}

export const createUpdateSchema = z.object({
  datum: z
    .string()
    .min(1, "Datum erforderlich")
    .transform(parseDateInput),
  kurztitel: z.string().trim().min(1, "Kurztitel erforderlich").max(200),
  detailtext: z.string().trim().min(1, "Detailtext erforderlich").max(10000),
});

export const updateUpdateSchema = createUpdateSchema;

export type CreateUpdateInput = z.infer<typeof createUpdateSchema>;
export type UpdateUpdateInput = z.infer<typeof updateUpdateSchema>;
