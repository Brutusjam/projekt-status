import { Resend } from "resend";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { ValidationError } from "@/lib/domain/errors";
import {
  getPublishedUpdateForMail,
  hasMailBeenSent,
  recordMailSend,
} from "@/lib/domain/mail/record";
import { listMailRecipients } from "@/lib/domain/users/queries";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export type MailSendResult = {
  sent: number;
  failed: number;
  skipped: boolean;
  message?: string;
};

export async function sendUpdateNotification(
  db: PrismaClient,
  updateId: number,
  baseUrl: string,
): Promise<MailSendResult> {
  const update = await getPublishedUpdateForMail(db, updateId);

  const alreadySent = await hasMailBeenSent(db, updateId);
  if (alreadySent) {
    return {
      sent: 0,
      failed: 0,
      skipped: true,
      message: "Benachrichtigung wurde bereits versendet.",
    };
  }

  const resend = getResendClient();
  if (!resend) {
    throw new ValidationError(
      "RESEND_API_KEY ist nicht konfiguriert.",
    );
  }

  const from = process.env.RESEND_FROM ?? "cockpit@example.local";
  const recipients = await listMailRecipients(db);

  if (recipients.length === 0) {
    return {
      sent: 0,
      failed: 0,
      skipped: true,
      message: "Keine aktiven Empfänger mit Mail-Abo.",
    };
  }

  const link = `${baseUrl.replace(/\/$/, "")}/projekte/${update.projektId}`;
  const subject = `Neues Update: ${update.projekt.titel}`;
  const text = [
    `Projekt: ${update.projekt.titel}`,
    `Update: ${update.kurztitel}`,
    "",
    `Details im Cockpit: ${link}`,
  ].join("\n");

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await resend.emails.send({
        from,
        to: recipient.email,
        subject,
        text,
      });
      await recordMailSend(db, updateId, recipient.email, "GESENDET");
      sent += 1;
    } catch {
      await recordMailSend(db, updateId, recipient.email, "FEHLGESCHLAGEN");
      failed += 1;
    }
  }

  return { sent, failed, skipped: false };
}
