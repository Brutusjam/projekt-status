"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchInput } from "@/components/ui/search-input";

export function ProjectSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(currentQuery);

  // Kurz warten, damit nicht jeder Tastendruck einen Seitenwechsel auslöst.
  useEffect(() => {
    if (value.trim() === currentQuery) {
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      const query = params.toString();
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, currentQuery, searchParams, router]);

  return (
    <SearchInput
      value={value}
      onChange={setValue}
      placeholder="Projekte suchen (Titel, Abteilung, Inhalt)"
      label="Projekte suchen"
    />
  );
}
