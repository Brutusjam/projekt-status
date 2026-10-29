import { PageHeader } from "@/components/layout/page-header";
import { ProjectReportForm } from "@/components/admin/project-report-form";
import { toDateInputValue } from "@/lib/date-input";

export default function AdminProjektberichtPage() {
  const today = new Date();
  const jahresbeginn = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administration"
        title="Projektbericht Prozessentwicklung"
        description="Gestalteter Bericht zuhanden Gemeinderat und RGPK."
      />

      <section className="rounded-xl border border-border p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          Dashboard mit Kennzahlen, danach pro Projekt alle Kopfdaten mit
          Beschrieb und angestrebter Wirkung sowie die publizierten Updates im
          Berichtszeitraum, neueste zuerst. Lässt du «Von» leer, werden alle
          Updates seit Beginn aufgeführt. Die Vorschau lässt sich auch direkt
          aus dem Browser als PDF drucken.
        </p>
        <ProjectReportForm
          defaultVon={toDateInputValue(jahresbeginn)}
          defaultBis={toDateInputValue(today)}
        />
      </section>
    </div>
  );
}
