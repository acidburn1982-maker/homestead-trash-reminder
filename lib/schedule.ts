export type PickupType = "garbage" | "recycling" | "bulky";

export interface PickupDay {
  date: string; // YYYY-MM-DD
  types: PickupType[];
}

// Zone 14 - Homestead FL - 2026 Schedule
// Garbage: Every Monday & Thursday (except holidays)
// Recycling: Bi-weekly Tuesdays (every 14 days, confirmed Apr 14)
// Bulky: Bi-weekly Fridays (every 14 days, starting Jan 2 — confirmed by resident)

const HOLIDAYS_NO_GARBAGE = [
  "2026-01-19", // MLK Day
  "2026-06-19", // Juneteenth
  "2026-12-25", // Christmas
];

const RECYCLING_DAYS = [
  "2026-01-06", "2026-01-20",
  "2026-02-03", "2026-02-17",
  "2026-03-03", "2026-03-17", "2026-03-31",
  "2026-04-14", "2026-04-28",
  "2026-05-12", "2026-05-26",
  "2026-06-09", "2026-06-23",
  "2026-07-07", "2026-07-21",
  "2026-08-04", "2026-08-18",
  "2026-09-01", "2026-09-15", "2026-09-29",
  "2026-10-13", "2026-10-27",
  "2026-11-10", "2026-11-24",
  "2026-12-08", "2026-12-22",
];

const BULKY_DAYS = [
  "2026-01-02", "2026-01-16", "2026-01-30",
  "2026-02-13", "2026-02-27",
  "2026-03-13", "2026-03-27",
  "2026-04-10", "2026-04-24",
  "2026-05-08", "2026-05-22",
  "2026-06-05", "2026-06-19",
  "2026-07-03", "2026-07-17", "2026-07-31",
  "2026-08-14", "2026-08-28",
  "2026-09-11", "2026-09-25",
  "2026-10-09", "2026-10-23",
  "2026-11-06", "2026-11-20",
  "2026-12-04", "2026-12-18",
];

// Get the current calendar day in Eastern Time as a Date anchored at
// 12:00 UTC of that day.
//
// Why noon-UTC: we only care about the calendar day, not the time of day.
// Anchoring at noon UTC means subsequent getDate()/getDay()/setDate()
// calls return the same calendar day in any reasonable server timezone,
// so day-arithmetic can never accidentally cross a date boundary.
//
// The previous implementation used `new Date(toLocaleString(...))` which
// double-translates: it formats the time in ET then re-parses that string
// AS IF it were the server's local timezone (UTC on Vercel). That produces
// a Date object roughly 4–5 hours off, which around UTC midnight (8pm ET)
// flipped "tomorrow" to the wrong day — so the 7pm ET evening cron sent
// reminders for the wrong pickup date.
function nowET(): Date {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function isGarbageDay(date: Date): boolean {
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu
  return day === 1 || day === 4;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getScheduleForMonth(year: number, month: number): PickupDay[] {
  const days: Map<string, PickupType[]> = new Map();

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dateStr = toDateString(date);
    const types: PickupType[] = [];

    if (isGarbageDay(date) && !HOLIDAYS_NO_GARBAGE.includes(dateStr)) {
      types.push("garbage");
    }
    if (RECYCLING_DAYS.includes(dateStr)) types.push("recycling");
    if (BULKY_DAYS.includes(dateStr)) types.push("bulky");

    if (types.length > 0) {
      days.set(dateStr, types);
    }
  }

  return Array.from(days.entries()).map(([date, types]) => ({ date, types }));
}

export function getUpcomingPickups(daysAhead = 7): PickupDay[] {
  const result: PickupDay[] = [];
  const today = nowET();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = toDateString(date);
    const types: PickupType[] = [];

    if (isGarbageDay(date) && !HOLIDAYS_NO_GARBAGE.includes(dateStr)) {
      types.push("garbage");
    }
    if (RECYCLING_DAYS.includes(dateStr)) types.push("recycling");
    if (BULKY_DAYS.includes(dateStr)) types.push("bulky");

    if (types.length > 0) {
      result.push({ date: dateStr, types });
    }
  }

  return result;
}

export function getTomorrowPickups(): PickupDay[] {
  const tomorrow = nowET();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dateStr = toDateString(tomorrow);
  const types: PickupType[] = [];

  if (isGarbageDay(tomorrow) && !HOLIDAYS_NO_GARBAGE.includes(dateStr)) {
    types.push("garbage");
  }
  if (RECYCLING_DAYS.includes(dateStr)) types.push("recycling");
  if (BULKY_DAYS.includes(dateStr)) types.push("bulky");

  if (types.length === 0) return [];
  return [{ date: dateStr, types }];
}

export function getTodayPickups(): PickupDay[] {
  const today = nowET();
  today.setHours(0, 0, 0, 0);
  const dateStr = toDateString(today);
  const types: PickupType[] = [];

  if (isGarbageDay(today) && !HOLIDAYS_NO_GARBAGE.includes(dateStr)) {
    types.push("garbage");
  }
  if (RECYCLING_DAYS.includes(dateStr)) types.push("recycling");
  if (BULKY_DAYS.includes(dateStr)) types.push("bulky");

  if (types.length === 0) return [];
  return [{ date: dateStr, types }];
}

export const PICKUP_LABELS: Record<PickupType, string> = {
  garbage: "Garbage",
  recycling: "Recycling",
  bulky: "Bulky Waste",
};

export const PICKUP_COLORS: Record<PickupType, string> = {
  garbage: "bg-yellow-500",
  recycling: "bg-green-500",
  bulky: "bg-blue-500",
};

export const PICKUP_TEXT_COLORS: Record<PickupType, string> = {
  garbage: "text-yellow-700",
  recycling: "text-green-700",
  bulky: "text-blue-700",
};

export const PICKUP_BG_LIGHT: Record<PickupType, string> = {
  garbage: "bg-yellow-50 border-yellow-200",
  recycling: "bg-green-50 border-green-200",
  bulky: "bg-blue-50 border-blue-200",
};
