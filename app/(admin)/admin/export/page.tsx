import { ExportImportPanel } from "@/components/admin/export-import-panel";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectReportForm } from "@/components/admin/project-report-form";
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
          <h2 className="font-medium">Projektbericht Prozessentwicklung</h2>
          <p className="text-sm text-muted-foreground">
            Gestalteter Bericht zuhanden Gemeinderat und RGPK: Dashboard mit
            Kennzahlen, danach pro Projekt alle Kopfdaten mit Beschrieb und
            angestrebter Wirkung sowie die publizierten Updates im
            Berichtszeitraum, neueste zuerst. Lässt du «Von» leer, werden alle
            Updates seit Beginn aufgeführt. Die Vorschau lässt sich auch direkt
            aus dem Browser als PDF drucken.
          </p>
        </div>
        <ProjectReportForm
          defaultVon={toDateInputValue(jahresbeginn)}
          defaultBis={toDateInputValue(today)}
        />
      </section>
    </div>
  );
}
