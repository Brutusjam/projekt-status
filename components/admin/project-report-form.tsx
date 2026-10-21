"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REPORT_URL = "/api/admin/pdf/rechenschaftsbericht";

/** Abbruch nach zwei Minuten, damit der Export nicht endlos wartet. */
const REQUEST_TIMEOUT_MS = 120_000;

type ProjectReportFormProps = {
  defaultVon: string;
  defaultBis: string;
};

export function ProjectReportForm({ defaultVon, defaultBis }: ProjectReportFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildQuery(form: HTMLFormElement): URLSearchParams {
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const key of ["von", "bis", "archiv"]) {
      const value = data.get(key);
      if (typeof value === "string" && value !== "") params.set(key, value);
    }
    return params;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch(`${REPORT_URL}?${buildQuery(event.currentTarget)}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `Der Server meldet Fehler ${response.status}.`);
      }
      // Abgelaufene Sitzung: fetch folgt der Weiterleitung und liefert die Login-Seite
      if (!response.headers.get("Content-Type")?.includes("application/pdf")) {
        throw new Error("Die Sitzung ist abgelaufen. Bitte Seite neu laden und erneut anmelden.");
      }
      const blob = await response.blob();
      const filename =
        response.headers.get("Content-Disposition")?.match(/filename="(.+?)"/)?.[1] ??
        "projektbericht-prozessentwicklung.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      // Firefox startet den Download nur über ein Element im DOM und bricht ihn ab,
      // wenn die Blob-URL sofort wieder freigegeben wird.
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caught) {
      setError(
        caught instanceof DOMException && caught.name === "TimeoutError"
          ? "Die PDF-Erzeugung dauert zu lange und wurde abgebrochen. Nutze «Vorschau im Browser» und speichere über Drucken als PDF."
          : caught instanceof Error
            ? caught.message
            : "Die PDF-Erzeugung ist fehlgeschlagen.",
      );
    } finally {
      setPending(false);
    }
  }

  function handlePreview(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!form) return;
    const params = buildQuery(form);
    params.set("format", "html");
    window.open(`${REPORT_URL}?${params}`, "_blank");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="bericht-von">Von</Label>
          <Input
            id="bericht-von"
            name="von"
            type="date"
            defaultValue={defaultVon}
            className="w-44"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bericht-bis">Bis</Label>
          <Input
            id="bericht-bis"
            name="bis"
            type="date"
            defaultValue={defaultBis}
            className="w-44"
            required
          />
        </div>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input type="checkbox" name="archiv" value="1" />
          Archivierte Projekte einbeziehen
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-60"
        >
          {pending ? "PDF wird erstellt…" : "Projektbericht als PDF"}
        </button>
        <button
          type="button"
          onClick={handlePreview}
          className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
        >
          Vorschau im Browser
        </button>
      </div>
      <p aria-live="polite" className="text-sm">
        {pending ? (
          <span className="text-muted-foreground">
            Das PDF wird auf dem Server erstellt. Das kann bis zu einer Minute dauern.
          </span>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : null}
      </p>
    </form>
  );
}
