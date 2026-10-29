import { describe, expect, it } from "vitest";
import { matchesSearch } from "@/lib/search";

describe("matchesSearch", () => {
  it("findet alles bei leerer Suche", () => {
    expect(matchesSearch(["Projekt A"], "")).toBe(true);
    expect(matchesSearch(["Projekt A"], undefined)).toBe(true);
  });

  it("ignoriert Gross-/Kleinschreibung und Umlaute", () => {
    expect(matchesSearch(["Schulraumplanung", "Bildung"], "SCHUL")).toBe(true);
    expect(matchesSearch(["In Abklärung"], "abklarung")).toBe(true);
  });

  it("verlangt jedes Suchwort in irgendeinem Feld", () => {
    expect(matchesSearch(["Wasserversorgung", "Werke"], "wasser werke")).toBe(true);
    expect(matchesSearch(["Wasserversorgung", "Werke"], "wasser bau")).toBe(false);
  });

  it("überspringt leere Felder", () => {
    expect(matchesSearch(["Titel", null, undefined], "titel")).toBe(true);
  });
});
