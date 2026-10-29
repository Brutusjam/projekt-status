"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Eye,
  MessageSquarePlus,
  Pencil,
} from "lucide-react";
import type { ProjektStatus } from "@/app/generated/prisma/client";
import { StatusBadge } from "@/components/projekte/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminProjectSummary } from "@/lib/domain/projects/admin-queries";
import { PROJEKT_STATUS_LABELS } from "@/lib/labels";
import { matchesSearch } from "@/lib/search";

type SortKey = "titel" | "abteilung" | "status" | "updates";
type Sort = { key: SortKey; dir: "asc" | "desc" };

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "titel", label: "Titel" },
  { key: "abteilung", label: "Abteilung" },
  { key: "status", label: "Status" },
  { key: "updates", label: "Updates" },
];

const STATUS_ORDER = Object.keys(PROJEKT_STATUS_LABELS);

function compare(a: AdminProjectSummary, b: AdminProjectSummary, key: SortKey) {
  switch (key) {
    case "titel":
      return a.titel.localeCompare(b.titel, "de-CH");
    case "abteilung":
      return a.abteilung.localeCompare(b.abteilung, "de-CH");
    case "status":
      return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    case "updates":
      return (
        a.publiziertCount - b.publiziertCount || a.entwurfCount - b.entwurfCount
      );
  }
}

function sortProjects(projects: AdminProjectSummary[], sort: Sort) {
  const factor = sort.dir === "asc" ? 1 : -1;
  return [...projects].sort(
    (a, b) =>
      factor * compare(a, b, sort.key) ||
      a.titel.localeCompare(b.titel, "de-CH"),
  );
}

function filterProjects(projects: AdminProjectSummary[], query: string) {
  return projects.filter((project) =>
    matchesSearch(
      [
        project.titel,
        project.abteilung,
        PROJEKT_STATUS_LABELS[project.status as ProjektStatus],
      ],
      query,
    ),
  );
}

export function AdminProjectTabs({
  active,
  archived,
}: {
  active: AdminProjectSummary[];
  archived: AdminProjectSummary[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>({ key: "titel", dir: "asc" });

  const visibleActive = useMemo(
    () => sortProjects(filterProjects(active, query), sort),
    [active, query, sort],
  );
  const visibleArchived = useMemo(
    () => sortProjects(filterProjects(archived, query), sort),
    [archived, query, sort],
  );

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  return (
    <div className="space-y-6">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Projekte suchen (Titel, Abteilung, Status)"
        label="Projekte suchen"
      />

      <Tabs defaultValue="aktiv">
        <TabsList>
          <TabsTrigger value="aktiv">Aktiv ({visibleActive.length})</TabsTrigger>
          <TabsTrigger value="archiv">
            Archiv ({visibleArchived.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aktiv" className="pt-6">
          <ProjectTable
            projects={visibleActive}
            empty={
              query
                ? "Keine Projekte für diese Suche."
                : "Noch keine Projekte vorhanden."
            }
            sort={sort}
            onSort={toggleSort}
          />
        </TabsContent>
        <TabsContent value="archiv" className="pt-6">
          <ProjectTable
            projects={visibleArchived}
            empty={
              query
                ? "Keine archivierten Projekte für diese Suche."
                : "Keine archivierten Projekte."
            }
            sort={sort}
            onSort={toggleSort}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectTable({
  projects,
  empty,
  sort,
  onSort,
}: {
  projects: AdminProjectSummary[];
  empty: string;
  sort: Sort;
  onSort: (key: SortKey) => void;
}) {
  if (projects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-muted-foreground">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            {COLUMNS.map((column) => {
              const active = sort.key === column.key;
              const SortIcon = !active
                ? ChevronsUpDown
                : sort.dir === "asc"
                  ? ArrowUp
                  : ArrowDown;
              return (
                <th
                  key={column.key}
                  aria-sort={
                    active
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className="px-4 py-3 font-medium"
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-primary"
                  >
                    {column.label}
                    <SortIcon
                      aria-hidden
                      className={
                        active ? "size-3.5" : "size-3.5 text-muted-foreground/60"
                      }
                    />
                  </button>
                </th>
              );
            })}
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium">{project.titel}</td>
              <td className="px-4 py-3 text-muted-foreground">{project.abteilung}</td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status as ProjektStatus} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {project.publiziertCount} publiziert, {project.entwurfCount} Entwürfe
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <ActionLink
                    href={`/projekte/${project.id}`}
                    label="Leseansicht"
                    icon={Eye}
                    newTab
                  />
                  <ActionLink
                    href={`/admin/projekte/${project.id}`}
                    label="Projekt bearbeiten"
                    icon={Pencil}
                  />
                  <ActionLink
                    href={`/admin/projekte/${project.id}/updates`}
                    label="Updates erfassen"
                    icon={MessageSquarePlus}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionLink({
  href,
  label,
  icon: Icon,
  newTab = false,
}: {
  href: string;
  label: string;
  icon: typeof Eye;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      target={newTab ? "_blank" : undefined}
      className="inline-flex size-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-muted"
    >
      <Icon className="size-4" />
    </Link>
  );
}
