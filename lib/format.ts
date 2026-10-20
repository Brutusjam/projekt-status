const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Zurich",
};

const DATETIME_FORMAT: Intl.DateTimeFormatOptions = {
  ...DATE_FORMAT,
  hour: "2-digit",
  minute: "2-digit",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Ab diesem Alter (in Tagen) fällt formatRelativeDate auf TT.MM.JJJJ zurück. */
const RELATIVE_FALLBACK_DAYS = 30;

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("de-CH", DATE_FORMAT).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("de-CH", DATETIME_FORMAT).format(
    new Date(date),
  );
}

/**
 * Relatives Datum in Europe/Zurich: «heute», «gestern», «vor 5 Tagen»,
 * ab ca. 30 Tagen Fallback auf TT.MM.JJJJ.
 */
export function formatRelativeDate(
  date: Date,
  now: Date = new Date(),
): string {
  const zurichDay = (value: Date | string) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Zurich",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(value));

  const dayDiff = Math.round(
    (new Date(`${zurichDay(now)}T12:00:00Z`).getTime() -
      new Date(`${zurichDay(date)}T12:00:00Z`).getTime()) /
      MS_PER_DAY,
  );

  if (dayDiff <= 0) {
    return "heute";
  }

  if (dayDiff === 1) {
    return "gestern";
  }

  if (dayDiff >= RELATIVE_FALLBACK_DAYS) {
    return formatDate(date);
  }

  return new Intl.RelativeTimeFormat("de-CH", { numeric: "auto" }).format(
    -dayDiff,
    "day",
  );
}
