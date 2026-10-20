import Link from "next/link";
import { StatusBadge } from "@/components/projekte/status-badge";
import { isUpdateStale } from "@/lib/domain/timeline";
import type { ProjectSummary } from "@/lib/domain/types";
import { formatDate, formatRelativeDate } from "@/lib/format";

type ProjectListItemProps = {
  project: ProjectSummary;
};

export function ProjectListItem({ project }: ProjectListItemProps) {
  const stale = isUpdateStale(project.letztesUpdate?.datum ?? null);

  return (
    <Link
      href={`/projekte/${project.id}`}
      className="block rounded-xl border border-brand-rose/60 bg-card px-4 py-4 transition-shadow hover:border-brand-rose hover:shadow-md sm:px-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {project.titel}
            </h2>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground">{project.abteilung}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-8">
          <div className="min-w-0 sm:w-56">
            <p className="eyebrow mb-0.5">Letztes Update</p>
            {project.letztesUpdate ? (
              <>
                <p className="truncate font-medium text-foreground">
                  {project.letztesUpdate.kurztitel}
                </p>
                <p className="text-muted-foreground">
                  {formatRelativeDate(project.letztesUpdate.datum)}
                </p>
                {stale ? (
                  <p className="text-xs text-muted-foreground">
                    Kein Update seit {formatDate(project.letztesUpdate.datum)}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">Noch kein Update</p>
            )}
          </div>

          <div className="min-w-0 sm:w-44">
            <p className="eyebrow mb-0.5">Nächster Termin</p>
            {project.naechsterTermin ? (
              <>
                <p className="font-medium text-foreground">
                  {formatDate(project.naechsterTermin)}
                </p>
                {project.naechsterTerminLabel ? (
                  <p className="truncate text-muted-foreground">
                    {project.naechsterTerminLabel}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">Kein Termin</p>
            )}
          </div>

          <span
            aria-hidden
            className="hidden text-muted-foreground sm:inline sm:pl-2"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
