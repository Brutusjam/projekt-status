"use client";

import { useActionState } from "react";
import {
  deleteUpdateFormAction,
  publishUpdateFormAction,
  removeUpdatePdfFormAction,
  sendMailFormAction,
} from "@/app/(admin)/admin/actions/form-wrappers";
import {
  attachUpdatePdfAction,
  updateUpdateAction,
} from "@/app/(admin)/admin/actions/updates";
import { MarkdownContent } from "@/components/projekte/markdown-content";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { formatDate } from "@/lib/format";
import { toDateInputValue } from "@/lib/date-input";
import { UPDATE_STATUS_LABELS } from "@/lib/labels";

type AdminUpdateItemProps = {
  projectId: number;
  update: {
    id: number;
    datum: Date;
    kurztitel: string;
    detailtext: string;
    status: "ENTWURF" | "PUBLIZIERT";
    publiziertAm: Date | null;
    pdfDateiname: string | null;
    pdfGroesse: number | null;
  };
  mailSent: boolean;
};

export function AdminUpdateItem({
  projectId,
  update,
  mailSent,
}: AdminUpdateItemProps) {
  const boundUpdate = updateUpdateAction.bind(null, projectId, update.id);
  const [state, action, pending] = useActionState(boundUpdate, {});

  const boundAttach = attachUpdatePdfAction.bind(null, projectId, update.id);
  const [attachState, attachAction, attachPending] = useActionState(
    boundAttach,
    {},
  );

  const hasPdf = Boolean(update.pdfDateiname);

  return (
    <article className="rounded-xl border border-border p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{formatDate(update.datum)}</p>
          <h3 className="font-medium">{update.kurztitel}</h3>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
          {UPDATE_STATUS_LABELS[update.status]}
        </span>
      </div>

      <MarkdownContent content={update.detailtext} />

      <div className="space-y-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
        <p className="text-sm font-medium">PDF-Anhang</p>
        {hasPdf ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a
              href={`/api/updates/${update.id}/pdf`}
              className="font-medium text-primary hover:underline"
            >
              {update.pdfDateiname}
            </a>
            {update.pdfGroesse ? (
              <span className="text-muted-foreground">
                ({Math.round(update.pdfGroesse / 1024)} KB)
              </span>
            ) : null}
            <form action={removeUpdatePdfFormAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="updateId" value={update.id} />
              <Button type="submit" variant="outline" size="sm">
                Entfernen
              </Button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Kein PDF angehängt.</p>
        )}
        <form action={attachAction} className="flex flex-wrap items-end gap-2">
          {attachState.error ? (
            <p className="w-full text-sm text-destructive">{attachState.error}</p>
          ) : null}
          <FormField label={hasPdf ? "PDF ersetzen" : "PDF hochladen"} htmlFor={`pdf-${update.id}`}>
            <Input
              id={`pdf-${update.id}`}
              name="pdf"
              type="file"
              accept="application/pdf,.pdf"
            />
          </FormField>
          <Button type="submit" variant="secondary" disabled={attachPending}>
            {attachPending ? "Hochladen…" : hasPdf ? "Ersetzen" : "Hochladen"}
          </Button>
        </form>
      </div>

      <form action={action} className="space-y-4 border-t border-border pt-4">
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Datum" htmlFor={`datum-${update.id}`}>
            <Input
              id={`datum-${update.id}`}
              name="datum"
              type="date"
              defaultValue={toDateInputValue(update.datum)}
            />
          </FormField>
          <FormField label="Kurztitel" htmlFor={`kurztitel-${update.id}`}>
            <Input
              id={`kurztitel-${update.id}`}
              name="kurztitel"
              defaultValue={update.kurztitel}
            />
          </FormField>
        </div>
        <FormField label="Detailtext" htmlFor={`detailtext-${update.id}`}>
          <MarkdownEditor
            id={`detailtext-${update.id}`}
            name="detailtext"
            defaultValue={update.detailtext}
            className="min-h-32"
          />
        </FormField>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={pending}>
            Speichern
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        {update.status === "ENTWURF" ? (
          <form action={publishUpdateFormAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="updateId" value={update.id} />
            <Button type="submit">Publizieren</Button>
          </form>
        ) : (
          <form action={sendMailFormAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="updateId" value={update.id} />
            <Button type="submit" variant="outline" disabled={mailSent}>
              {mailSent ? "Benachrichtigung gesendet" : "Benachrichtigung senden"}
            </Button>
          </form>
        )}
        <form
          action={deleteUpdateFormAction}
          onSubmit={(event) => {
            const ok = window.confirm(
              update.status === "PUBLIZIERT"
                ? "Möchtest du dieses publizierte Update wirklich löschen? Die Aktion kann nicht rückgängig gemacht werden."
                : "Möchtest du diesen Entwurf wirklich löschen?",
            );
            if (!ok) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="updateId" value={update.id} />
          <Button type="submit" variant="destructive">
            {update.status === "ENTWURF" ? "Entwurf löschen" : "Update löschen"}
          </Button>
        </form>
      </div>
    </article>
  );
}
