"use client";

import { getUpcomingPickups, PICKUP_LABELS, PICKUP_BG_LIGHT, PICKUP_TEXT_COLORS, PICKUP_COLORS } from "@/lib/schedule";
import { Language, t as i18n } from "@/lib/i18n";

function formatDate(dateStr: string, lang: Language) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const strings = i18n[lang] || i18n.en;

  if (date.getTime() === today.getTime()) return strings.today;
  if (date.getTime() === tomorrow.getTime()) return strings.tomorrow;

  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

interface Props {
  lang?: Language;
}

export default function UpcomingPickups({ lang = "en" }: Props) {
  const upcoming = getUpcomingPickups(7);
  const strings = i18n[lang] || i18n.en;

  if (upcoming.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-bold text-gray-800 text-lg mb-2">{strings.upcomingPickups}</h2>
        <p className="text-gray-500 text-sm">{strings.noPickups}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="font-bold text-gray-800 text-lg mb-4">{strings.upcomingPickups}</h2>
      <div className="space-y-3">
        {upcoming.map(({ date, types }) => (
          <div key={date} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 w-32">{formatDate(date, lang)}</span>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <span
                  key={type}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${PICKUP_BG_LIGHT[type]} ${PICKUP_TEXT_COLORS[type]}`}
                >
                  <span className={`w-2 h-2 rounded-full ${PICKUP_COLORS[type]}`} />
                  {PICKUP_LABELS[type]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
