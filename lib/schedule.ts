export type PickupType = "garbage" | "recycling" | "bulky";

export interface PickupDay {
  date: string; // YYYY-MM-DD
  types: PickupType[];
}

// Zone 14 - Homestead FL - 2026 Schedule
// Garbage: Every Monday & Thursday (except holidays)
// Recycling: Bi-weekly Wednesdays
// Bulky: Bi-weekly Saturdays

const HOLIDAYS_NO_GARBAGE = [
  "2026-01-19", // MLK Day
  "2026-06-19", // Juneteenth
  "2026-12-25", // Christmas
];

const RECYCLING_DAYS = [
  "2026-01-07", "2026-01-21",
  "2026-02-04", "2026-02-18",
  "2026-03-04", "2026-03-18",
  "2026-04-01", "2026-04-15", "2026-04-29",
  "2026-05-13", "2026-05-27",
  "2026-06-10", "2026-06-24",
  "2026-07-08", "2026-07-22",
  "2026-08-05", "2026-08-19",
  "2026-09-02", "2026-09-16", "2026-09-30",
  "2026-10-14", "2026-10-28",
  "2026-11-11", "2026-11-25",
  "2026-12-09", "2026-12-23",
];

const BULKY_DAYS = [
  "2026-01-03", "2026-01-17", "2026-01-31",
  "2026-02-14", "2026-02-28",
  "2026-03-14", "2026-03-28",
  "2026-04-11", "2026-04-25",
  "2026-05-09", "2026-05-23",
  "2026-06-06", "2026-06-20",
  "2026-07-04", "2026-07-18",
  "2026-08-01", "2026-08-15", "2026-08-29",
  "2026-09-12", "2026-09-26",
  "2026-10-10", "2026-10-24",
  "2026-11-07", "2026-11-21",
  "2026-12-05", "2026-12-19",
];

function isGarbageDay(date: Date): boolean {
  const day = date.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu
  return day === 1 || day === 4;
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
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
  const today = new Date();
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
  const tomorrow = new Date();
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
