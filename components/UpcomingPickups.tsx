"use client";

import { getUpcomingPickups, PICKUP_LABELS, PICKUP_BG_LIGHT, PICKUP_TEXT_COLORS, PICKUP_COLORS } from "@/lib/schedule";

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function UpcomingPickups() {
  const upcoming = getUpcomingPickups(7);

  if (upcoming.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-bold text-gray-800 text-lg mb-2">Upcoming Pickups</h2>
        <p className="text-gray-500 text-sm">No pickups in the next 7 days.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="font-bold text-gray-800 text-lg mb-4">Upcoming Pickups</h2>
      <div className="space-y-3">
        {upcoming.map(({ date, types }) => (
          <div key={date} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 w-32">{formatDate(date)}</span>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <span
                  key={t}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${PICKUP_BG_LIGHT[t]} ${PICKUP_TEXT_COLORS[t]}`}
                >
                  <span className={`w-2 h-2 rounded-full ${PICKUP_COLORS[t]}`} />
                  {PICKUP_LABELS[t]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
