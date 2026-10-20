import { z } from "zod";
import type { Rolle } from "@/app/generated/prisma/client";

const rolleEnum = z.enum(["ADMIN", "LESER"]);

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name erforderlich").max(100),
  email: z
    .string()
    .trim()
    .email("Ungültige E-Mail")
    .transform((v) => v.toLowerCase()),
  rolle: rolleEnum,
  initialPassword: z
    .string()
    .min(8, "Passwort mindestens 8 Zeichen")
    .max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Aktuelles Passwort erforderlich"),
    newPassword: z
      .string()
      .min(8, "Neues Passwort mindestens 8 Zeichen")
      .max(200),
    confirmPassword: z.string().min(1, "Bestätigung erforderlich"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type { Rolle };
