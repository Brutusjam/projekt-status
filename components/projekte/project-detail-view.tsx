import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/projekte/status-badge";
import { UpdateTimelineItem } from "@/components/projekte/update-timeline-item";
import { formatDate } from "@/lib/format";
import type { ProjectDetail } from "@/lib/domain/types";

type ProjectDetailViewProps = {
  project: ProjectDetail;
  backHref?: string;
  backLabel?: string;
  previewNotice?: string | null;
};

export function ProjectDetailView({
  project,
  backHref,
  backLabel = "Zurück zur Übersicht",
  previewNotice,
}: ProjectDetailViewProps) {
  return (
    <div className="space-y-10">
      {previewNotice ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          {previewNotice}
        </p>
      ) : null}

      <div className="flex flex-col gap-8">
        {backHref ? (
          <Link
            href={backHref}
            className="block text-sm font-medium text-primary hover:underline"
          >
            {backLabel}
          </Link>
        ) : null}
        <PageHeader eyebrow={project.abteilung} title={project.titel} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div>
            <p className="eyebrow mb-2">Kurzbeschrieb</p>
            <p className="leading-relaxed text-foreground">
              {project.kurzbeschrieb}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-1">Ansprechperson</p>
              <p>{project.ansprechperson}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Startdatum</p>
              <p>{formatDate(project.startdatum)}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Status</p>
              <StatusBadge status={project.status} />
            </div>
            {project.naechsterTermin ? (
              <div>
                <p className="eyebrow mb-1">Nächster Termin</p>
                <p>{formatDate(project.naechsterTermin)}</p>
                {project.naechsterTerminLabel ? (
                  <p className="text-sm text-muted-foreground">
                    {project.naechsterTerminLabel}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl bg-accent-block p-6 text-accent-block-foreground">
          <p className="eyebrow mb-3 text-accent-block-foreground/70">Wirkung</p>
          <p className="leading-relaxed">{project.wirkung}</p>
        </aside>
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">Timeline</p>
          <h2 className="font-heading text-2xl font-semibold">Updates</h2>
        </div>
        {project.updates.length === 0 ? (
          <p className="text-muted-foreground">
            Noch keine publizierten Updates sichtbar.
          </p>
        ) : (
          <div className="space-y-4">
            {project.updates.map((update) => (
              <UpdateTimelineItem
                key={update.id}
                id={update.id}
                datum={update.datum}
                kurztitel={update.kurztitel}
                detailtext={update.detailtext}
                pdfDateiname={update.pdfDateiname}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
