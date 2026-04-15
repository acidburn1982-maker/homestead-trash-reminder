"use client";

import { getScheduleForMonth, PICKUP_COLORS, PickupType } from "@/lib/schedule";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Props {
  year: number;
  month: number; // 1-12
}

export default function Calendar({ year, month }: Props) {
  const pickups = getScheduleForMonth(year, month);
  const pickupMap = new Map<number, PickupType[]>();
  for (const p of pickups) {
    const day = parseInt(p.date.split("-")[2]);
    pickupMap.set(day, p.types);
  }

  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-center font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
        {MONTH_NAMES[month - 1]}
      </h3>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-400 pb-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const types = pickupMap.get(day) ?? [];
          const isToday = isCurrentMonth && today.getDate() === day;

          return (
            <div
              key={day}
              className={`relative flex flex-col items-center py-1 rounded-lg ${
                isToday ? "ring-2 ring-blue-400 bg-blue-50" : ""
              }`}
            >
              <span className={`text-xs ${isToday ? "font-bold text-blue-700" : "text-gray-700"}`}>
                {day}
              </span>
              {types.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {types.map((t) => (
                    <span
                      key={t}
                      className={`w-2 h-2 rounded-full ${PICKUP_COLORS[t]}`}
                      title={t}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
