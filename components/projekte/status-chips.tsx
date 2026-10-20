"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ProjektStatus } from "@/app/generated/prisma/client";
import { PROJEKT_STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const STATUS_CHIP_STYLES: Record<
  ProjektStatus,
  { idle: string; active: string }
> = {
  IDEE: {
    idle: "border-transparent bg-status-idee/60 text-status-idee-foreground hover:bg-status-idee",
    active: "border-status-idee-foreground/30 bg-status-idee text-status-idee-foreground ring-2 ring-status-idee-foreground/20",
  },
  IN_ABKLAERUNG: {
    idle: "border-transparent bg-status-abklaerung/60 text-status-abklaerung-foreground hover:bg-status-abklaerung",
    active:
      "border-status-abklaerung-foreground/30 bg-status-abklaerung text-status-abklaerung-foreground ring-2 ring-status-abklaerung-foreground/20",
  },
  IN_UMSETZUNG: {
    idle: "border-transparent bg-status-umsetzung/60 text-status-umsetzung-foreground hover:bg-status-umsetzung",
    active:
      "border-status-umsetzung-foreground/30 bg-status-umsetzung text-status-umsetzung-foreground ring-2 ring-status-umsetzung-foreground/20",
  },
  PILOTBETRIEB: {
    idle: "border-transparent bg-status-pilot/60 text-status-pilot-foreground hover:bg-status-pilot",
    active:
      "border-status-pilot-foreground/30 bg-status-pilot text-status-pilot-foreground ring-2 ring-status-pilot-foreground/20",
  },
  ABGESCHLOSSEN: {
    idle: "border-transparent bg-status-abgeschlossen/60 text-status-abgeschlossen-foreground hover:bg-status-abgeschlossen",
    active:
      "border-status-abgeschlossen-foreground/30 bg-status-abgeschlossen text-status-abgeschlossen-foreground ring-2 ring-status-abgeschlossen-foreground/20",
  },
  PAUSIERT: {
    idle: "border-border bg-status-pausiert text-status-pausiert-foreground hover:bg-muted",
    active:
      "border-border bg-status-pausiert text-status-pausiert-foreground ring-2 ring-border",
  },
};

type StatusChipsProps = {
  counts: Record<ProjektStatus, number>;
  total: number;
};

export function StatusChips({ counts, total }: StatusChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "";

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Status filter">
      <button
        type="button"
        onClick={() => setStatus("")}
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          currentStatus === ""
            ? "border-foreground/20 bg-foreground text-background ring-2 ring-foreground/15"
            : "border-border bg-background text-foreground hover:bg-muted",
        )}
      >
        Alle ({total})
      </button>

      {(Object.keys(PROJEKT_STATUS_LABELS) as ProjektStatus[]).map((status) => {
        const count = counts[status] ?? 0;
        const active = currentStatus === status;
        const styles = STATUS_CHIP_STYLES[status];

        return (
          <button
            type="button"
            key={status}
            onClick={() => setStatus(active ? "" : status)}
            disabled={count === 0 && !active}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              active ? styles.active : styles.idle,
            )}
          >
            {PROJEKT_STATUS_LABELS[status]} ({count})
          </button>
        );
      })}
    </div>
  );
}
