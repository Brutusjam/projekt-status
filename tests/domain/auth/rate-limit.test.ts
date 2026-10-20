import { describe, expect, it, beforeEach } from "vitest";
import {
  checkLoginAllowed,
  clearLoginAttemptsForTests,
  recordLoginFailure,
  resetLoginAttempts,
  MAX_ATTEMPTS,
} from "@/lib/domain/auth/rate-limit";

describe("rate limiting (R9)", () => {
  beforeEach(() => {
    clearLoginAttemptsForTests();
  });

  it("erlaubt Login initial", () => {
    expect(checkLoginAllowed("test@example.local").allowed).toBe(true);
  });

  it("sperrt nach MAX_ATTEMPTS Fehlversuchen", () => {
    const email = "locked@example.local";
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      recordLoginFailure(email);
    }

    const status = checkLoginAllowed(email);
    expect(status.allowed).toBe(false);
    expect(status.lockedUntil).not.toBeNull();
  });

  it("setzt Sperre nach erfolgreichem Login zurück", () => {
    const email = "reset@example.local";
    recordLoginFailure(email);
    resetLoginAttempts(email);
    expect(checkLoginAllowed(email).allowed).toBe(true);
  });
});
