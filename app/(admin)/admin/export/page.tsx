import { ExportImportPanel } from "@/components/admin/export-import-panel";
import { PageHeader } from "@/components/layout/page-header";

export default function AdminExportPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Einstellungen"
        title="Export und Import"
        description="Datenhoheit über vollständigen JSON-Export und verlustfreien Import."
      />
      <ExportImportPanel />
    </div>
  );
}
