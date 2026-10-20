import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/projekte/status-badge";
import { isUpdateStale } from "@/lib/domain/timeline";
import type { ProjectSummary } from "@/lib/domain/types";
import { formatDate, formatRelativeDate } from "@/lib/format";

type ProjectCardProps = {
  project: ProjectSummary;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const stale = isUpdateStale(project.letztesUpdate?.datum ?? null);

  return (
    <Link href={`/projekte/${project.id}`} className="block h-full">
      <Card className="flex h-full flex-col border-brand-rose/60 transition-shadow hover:border-brand-rose hover:shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="font-heading text-xl">
                {project.titel}
              </CardTitle>
              <CardDescription>{project.abteilung}</CardDescription>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-4 text-sm text-muted-foreground">
          <div className="grid gap-4">
            <div>
              <p className="eyebrow mb-1">Letztes Update</p>
              {project.letztesUpdate ? (
                <>
                  <p className="font-medium text-foreground">
                    {project.letztesUpdate.kurztitel}
                  </p>
                  <p>{formatRelativeDate(project.letztesUpdate.datum)}</p>
                  {stale ? (
                    <p className="mt-1 text-xs">
                      Kein Update seit {formatDate(project.letztesUpdate.datum)}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="font-medium text-foreground">Noch kein Update</p>
              )}
            </div>
            <div>
              <p className="eyebrow mb-1">Nächster Termin</p>
              {project.naechsterTermin ? (
                <>
                  <p className="font-medium text-foreground">
                    {formatDate(project.naechsterTermin)}
                  </p>
                  {project.naechsterTerminLabel ? (
                    <p>{project.naechsterTerminLabel}</p>
                  ) : null}
                </>
              ) : (
                <p className="font-medium text-foreground">Kein Termin</p>
              )}
            </div>
          </div>
          <p className="text-right text-xs font-medium text-foreground">
            Details →
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
