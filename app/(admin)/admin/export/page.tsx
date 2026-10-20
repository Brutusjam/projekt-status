import { ExportImportPanel } from "@/components/admin/export-import-panel";
import { PageHeader } from "@/components/layout/page-header";

export default function AdminExportPage() {
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
    </div>
  );
}
