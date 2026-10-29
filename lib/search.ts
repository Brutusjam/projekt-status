/** Normalisiert für die Suche: Kleinschreibung, ohne Akzente (ä → a). */
function normalize(value: string): string {
  return value
    .toLocaleLowerCase("de-CH")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Jedes Suchwort muss in mindestens einem der Felder vorkommen. */
export function matchesSearch(
  fields: (string | null | undefined)[],
  query: string | null | undefined,
): boolean {
  const words = normalize(query ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return true;
  }

  const haystack = normalize(fields.filter(Boolean).join(" "));
  return words.every((word) => haystack.includes(word));
}
