"use client";

import type { ProjektStatus } from "@/app/generated/prisma/client";
import type { ActionState } from "@/app/(admin)/admin/actions/projects";
import { PROJEKT_STATUS_LABELS } from "@/lib/labels";
import { toDateInputValue } from "@/lib/date-input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

type ProjectFormProps = {
  action: (formData: FormData) => void;
  initial?: {
    titel: string;
    abteilung: string;
    ansprechperson: string;
    status: ProjektStatus;
    startdatum: Date;
    naechsterTermin: Date | null;
    naechsterTerminLabel: string | null;
    kurzbeschrieb: string;
    wirkung: string;
  };
  submitLabel: string;
  state: ActionState;
  pending: boolean;
};

export function ProjectFormFields({
  action,
  initial,
  submitLabel,
  state,
  pending,
}: ProjectFormProps) {
  return (
    <form action={action} className="space-y-8">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Titel" htmlFor="titel" error={state.fieldErrors?.titel}>
          <Input
            id="titel"
            name="titel"
            defaultValue={initial?.titel}
            required
          />
        </FormField>
        <FormField
          label="Abteilung"
          htmlFor="abteilung"
          error={state.fieldErrors?.abteilung}
        >
          <Input
            id="abteilung"
            name="abteilung"
            defaultValue={initial?.abteilung}
            required
          />
        </FormField>
        <FormField
          label="Ansprechperson (Kürzel)"
          htmlFor="ansprechperson"
          error={state.fieldErrors?.ansprechperson}
        >
          <Input
            id="ansprechperson"
            name="ansprechperson"
            defaultValue={initial?.ansprechperson}
            required
          />
        </FormField>
        <FormField label="Status" htmlFor="status" error={state.fieldErrors?.status}>
          <Select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "IDEE"}
          >
            {Object.entries(PROJEKT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Startdatum"
          htmlFor="startdatum"
          error={state.fieldErrors?.startdatum}
        >
          <Input
            id="startdatum"
            name="startdatum"
            type="date"
            defaultValue={
              initial ? toDateInputValue(initial.startdatum) : undefined
            }
            required
          />
        </FormField>
        <FormField
          label="Nächster Termin"
          htmlFor="naechsterTermin"
          error={state.fieldErrors?.naechsterTermin}
        >
          <Input
            id="naechsterTermin"
            name="naechsterTermin"
            type="date"
            defaultValue={
              initial?.naechsterTermin
                ? toDateInputValue(initial.naechsterTermin)
                : undefined
            }
          />
        </FormField>
      </div>

      <FormField
        label="Bezeichnung nächster Termin"
        htmlFor="naechsterTerminLabel"
        error={state.fieldErrors?.naechsterTerminLabel}
      >
        <Input
          id="naechsterTerminLabel"
          name="naechsterTerminLabel"
          defaultValue={initial?.naechsterTerminLabel ?? undefined}
        />
      </FormField>

      <FormField
        label="Kurzbeschrieb"
        htmlFor="kurzbeschrieb"
        error={state.fieldErrors?.kurzbeschrieb}
      >
        <MarkdownEditor
          id="kurzbeschrieb"
          name="kurzbeschrieb"
          defaultValue={initial?.kurzbeschrieb}
          required
        />
      </FormField>

      <FormField label="Wirkung" htmlFor="wirkung" error={state.fieldErrors?.wirkung}>
        <MarkdownEditor
          id="wirkung"
          name="wirkung"
          defaultValue={initial?.wirkung}
          required
        />
      </FormField>

      <Button type="submit" disabled={pending}>
        {pending ? "Speichern…" : submitLabel}
      </Button>
    </form>
  );
}
