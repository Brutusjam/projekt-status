"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MarkdownContent } from "@/components/projekte/markdown-content";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type UpdateTimelineItemProps = {
  id: number;
  datum: Date;
  kurztitel: string;
  detailtext: string;
  pdfDateiname?: string | null;
  projektTitel?: string;
  projektHref?: string;
};

export function UpdateTimelineItem({
  id,
  datum,
  kurztitel,
  detailtext,
  pdfDateiname,
  projektTitel,
  projektHref,
}: UpdateTimelineItemProps) {
  return (
    <Collapsible
      defaultOpen
      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-rose/70"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {projektTitel && projektHref ? (
            <Link
              href={projektHref}
              className="text-sm font-medium text-primary hover:underline"
            >
              {projektTitel}
            </Link>
          ) : null}
          <CollapsibleTrigger
            className={cn(
              "group flex items-center gap-2 text-left font-heading text-base font-medium text-foreground transition-colors hover:text-primary",
            )}
          >
            <ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            {kurztitel}
          </CollapsibleTrigger>
        </div>
        <time
          dateTime={new Date(datum).toISOString()}
          className="text-sm text-muted-foreground"
        >
          {formatDate(datum)}
        </time>
      </div>
      <CollapsibleContent className="timeline-detail pt-4 space-y-3">
        <MarkdownContent content={detailtext} />
        {pdfDateiname ? (
          <p>
            <a
              href={`/api/updates/${id}/pdf`}
              className="text-sm font-medium text-primary hover:underline"
            >
              PDF herunterladen ({pdfDateiname})
            </a>
          </p>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
