"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type AnsichtMode = "karten" | "liste";

type ViewToggleProps = {
  className?: string;
};

export function ViewToggle({ className }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current: AnsichtMode =
    searchParams.get("ansicht") === "karten" ? "karten" : "liste";

  function setAnsicht(mode: AnsichtMode) {
    const params = new URLSearchParams(searchParams.toString());

    if (mode === "liste") {
      params.delete("ansicht");
    } else {
      params.set("ansicht", mode);
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-background p-0.5",
        className,
      )}
      role="group"
      aria-label="Ansicht"
    >
      <button
        type="button"
        onClick={() => setAnsicht("karten")}
        aria-pressed={current === "karten"}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          current === "karten"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Karten
      </button>
      <button
        type="button"
        onClick={() => setAnsicht("liste")}
        aria-pressed={current === "liste"}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          current === "liste"
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Liste
      </button>
    </div>
  );
}
