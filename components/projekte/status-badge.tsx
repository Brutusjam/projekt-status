import type { ProjektStatus } from "@/app/generated/prisma/client";
import { getProjektStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

const statusStyles: Record<ProjektStatus, string> = {
  IDEE: "bg-status-idee text-status-idee-foreground",
  IN_ABKLAERUNG: "bg-status-abklaerung text-status-abklaerung-foreground",
  IN_UMSETZUNG: "bg-status-umsetzung text-status-umsetzung-foreground",
  PILOTBETRIEB: "bg-status-pilot text-status-pilot-foreground",
  ABGESCHLOSSEN: "bg-status-abgeschlossen text-status-abgeschlossen-foreground",
  PAUSIERT:
    "border border-border bg-status-pausiert text-status-pausiert-foreground",
};

type StatusBadgeProps = {
  status: ProjektStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
        className,
      )}
    >
      {getProjektStatusLabel(status)}
    </span>
  );
}
