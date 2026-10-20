import { describe, expect, it } from "vitest";
import { requireAdmin, requireAuthenticated } from "@/lib/domain/authorization";
import { ForbiddenError } from "@/lib/domain/errors";

describe("authorization (R1)", () => {
  it("requireAdmin erlaubt ADMIN", () => {
    expect(() => requireAdmin("ADMIN")).not.toThrow();
  });

  it("requireAdmin lehnt LESER ab", () => {
    expect(() => requireAdmin("LESER")).toThrow(ForbiddenError);
  });

  it("requireAdmin lehnt fehlende Rolle ab", () => {
    expect(() => requireAdmin(undefined)).toThrow(ForbiddenError);
  });

  it("requireAuthenticated lehnt Gäste ab", () => {
    expect(() => requireAuthenticated(undefined)).toThrow(ForbiddenError);
  });
});
