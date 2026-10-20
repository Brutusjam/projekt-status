"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ProjectFiltersProps = {
  abteilungen: string[];
};

export function ProjectFilters({ abteilungen }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentAbteilung = searchParams.get("abteilung") ?? "";

  function updateAbteilung(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("abteilung", value);
    } else {
      params.delete("abteilung");
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <label className="flex min-w-48 flex-col gap-2 text-sm">
      <span className="eyebrow">Abteilung</span>
      <select
        value={currentAbteilung}
        onChange={(event) => updateAbteilung(event.target.value)}
        className="rounded-lg border border-input bg-background px-3 py-2"
      >
        <option value="">Alle Abteilungen</option>
        {abteilungen.map((abteilung) => (
          <option key={abteilung} value={abteilung}>
            {abteilung}
          </option>
        ))}
      </select>
    </label>
  );
}
