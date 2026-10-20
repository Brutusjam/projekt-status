"use client";

import { useActionState } from "react";
import { createUpdateAction } from "@/app/(admin)/admin/actions/updates";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { toDateInputValue } from "@/lib/date-input";

export function NewUpdateForm({ projectId }: { projectId: number }) {
  const createAction = createUpdateAction.bind(null, projectId);
  const [state, action, pending] = useActionState(createAction, {});

  return (
    <form action={action} className="space-y-6" encType="multipart/form-data">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <FormField label="Datum" htmlFor="datum" error={state.fieldErrors?.datum}>
        <Input
          id="datum"
          name="datum"
          type="date"
          defaultValue={toDateInputValue(new Date())}
          required
        />
      </FormField>
      <FormField
        label="Kurztitel"
        htmlFor="kurztitel"
        error={state.fieldErrors?.kurztitel}
      >
        <Input id="kurztitel" name="kurztitel" required />
      </FormField>
      <FormField
        label="Detailtext"
        htmlFor="detailtext"
        error={state.fieldErrors?.detailtext}
      >
        <MarkdownEditor
          id="detailtext"
          name="detailtext"
          className="min-h-40"
          required
        />
      </FormField>
      <FormField label="PDF-Anhang (optional)" htmlFor="pdf">
        <Input id="pdf" name="pdf" type="file" accept="application/pdf,.pdf" />
        <p className="mt-1 text-xs text-muted-foreground">
          Max. 10 MB, nur PDF.
        </p>
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Speichern…" : "Update als Entwurf speichern"}
      </Button>
    </form>
  );
}
