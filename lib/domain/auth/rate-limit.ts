const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type AttemptRecord = {
  failures: number;
  lockedUntil: number | null;
};

const attempts = new Map<string, AttemptRecord>();

export function resetLoginAttempts(email: string): void {
  attempts.delete(email.toLowerCase());
}

export function checkLoginAllowed(email: string): {
  allowed: boolean;
  lockedUntil: Date | null;
} {
  const record = attempts.get(email.toLowerCase());
  if (!record?.lockedUntil) {
    return { allowed: true, lockedUntil: null };
  }

  if (Date.now() >= record.lockedUntil) {
    attempts.delete(email.toLowerCase());
    return { allowed: true, lockedUntil: null };
  }

  return { allowed: false, lockedUntil: new Date(record.lockedUntil) };
}

export function recordLoginFailure(email: string): {
  locked: boolean;
  remainingAttempts: number;
} {
  const key = email.toLowerCase();
  const record = attempts.get(key) ?? { failures: 0, lockedUntil: null };
  record.failures += 1;

  if (record.failures >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
    attempts.set(key, record);
    return { locked: true, remainingAttempts: 0 };
  }

  attempts.set(key, record);
  return {
    locked: false,
    remainingAttempts: MAX_ATTEMPTS - record.failures,
  };
}

export function clearLoginAttemptsForTests(): void {
  attempts.clear();
}

export { MAX_ATTEMPTS, LOCKOUT_MS };
