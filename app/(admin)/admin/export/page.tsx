import { ExportImportPanel } from "@/components/admin/export-import-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDateInputValue } from "@/lib/date-input";

export default function AdminExportPage() {
  const today = new Date();
  const jahresbeginn = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Export und Import"
        description="Datenhoheit über vollständigen JSON-Export und verlustfreien Import."
      />
      <ExportImportPanel />

      <section className="rounded-xl border border-border p-5 space-y-3">
        <h2 className="font-medium">PDF-Berichte</h2>
        <p className="text-sm text-muted-foreground">
          Gesamtübersicht für den Monatsbericht als PDF exportieren.
        </p>
        <a
          href="/api/admin/pdf/uebersicht"
          className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Gesamtübersicht als PDF
        </a>
      </section>

      <section className="rounded-xl border border-border p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="font-medium">Rechenschaftsbericht</h2>
          <p className="text-sm text-muted-foreground">
            Gestalteter Bericht für die Rechnungsprüfungskommission: Dashboard mit
            Kennzahlen, danach pro Projekt alle Kopfdaten mit Beschrieb und
            angestrebter Wirkung sowie die publizierten Updates im
            Berichtszeitraum, neueste zuerst. Lässt du «Von» leer, werden alle
            Updates seit Beginn aufgeführt.
          </p>
        </div>
        <form
          action="/api/admin/pdf/rechenschaftsbericht"
          method="get"
          className="flex flex-wrap items-end gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="bericht-von">Von</Label>
            <Input
              id="bericht-von"
              name="von"
              type="date"
              defaultValue={toDateInputValue(jahresbeginn)}
              className="w-44"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bericht-bis">Bis</Label>
            <Input
              id="bericht-bis"
              name="bis"
              type="date"
              defaultValue={toDateInputValue(today)}
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
            className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Rechenschaftsbericht als PDF
          </button>
          <button
            type="submit"
            name="format"
            value="html"
            formTarget="_blank"
            className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
          >
            Vorschau im Browser
          </button>
        </form>
      </section>
    </div>
  );
}
