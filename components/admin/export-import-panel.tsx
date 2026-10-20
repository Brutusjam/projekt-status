"use client";

import { useActionState, useState } from "react";
import {
  exportDatabaseAction,
  importDatabaseAction,
} from "@/app/(admin)/admin/actions/export-mail";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ExportImportPanel() {
  const [exportData, setExportData] = useState<string>("");
  const [importState, importAction, importPending] = useActionState(
    importDatabaseAction,
    {},
  );

  async function handleExport() {
    const data = await exportDatabaseAction();
    setExportData(data);
  }

  function handleDownload() {
    if (!exportData) return;
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `projektcockpit-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-xl border border-border p-5">
        <h2 className="font-medium">JSON-Export</h2>
        <p className="text-sm text-muted-foreground">
          Vollständiger Export aller Entitäten für Backup und Datenhoheit.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleExport}>
            Export erzeugen
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!exportData}
          >
            Als Datei herunterladen
          </Button>
        </div>
        {exportData ? (
          <Textarea
            readOnly
            value={exportData}
            className="min-h-48 font-mono text-xs"
          />
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-border p-5">
        <h2 className="font-medium">JSON-Import</h2>
        <p className="text-sm text-muted-foreground">
          Stellt den exportierten Zustand vollständig wieder her. Ersetzt alle
          bestehenden Daten.
        </p>
        <form action={importAction} className="space-y-4">
          {importState.error ? (
            <p className="text-sm text-destructive">{importState.error}</p>
          ) : null}
          {importState.success ? (
            <p className="text-sm text-green-700">{importState.success}</p>
          ) : null}
          <Textarea
            name="content"
            placeholder="JSON-Inhalt einfügen…"
            className="min-h-48 font-mono text-xs"
            required
          />
          <Button type="submit" variant="destructive" disabled={importPending}>
            {importPending ? "Import läuft…" : "Import starten"}
          </Button>
        </form>
      </section>
    </div>
  );
}
