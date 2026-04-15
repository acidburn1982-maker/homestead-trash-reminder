import Calendar from "@/components/Calendar";
import UpcomingPickups from "@/components/UpcomingPickups";
import LangToggle from "@/components/LangToggle";
import ShareButtons from "@/components/ShareButtons";
import Link from "next/link";
import { t, Language } from "@/lib/i18n";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const lang = (params.lang as Language) || "en";
  const strings = t[lang] || t.en;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">🗑️ {strings.siteTitle}</h1>
            <p className="text-blue-200 text-sm mt-1">{strings.siteSubtitle}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <LangToggle currentLang={lang} />
            <Link
              href={`/subscribe${lang !== "en" ? `?lang=${lang}` : ""}`}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-5 py-2 rounded-full transition text-sm whitespace-nowrap"
            >
              🔔 {strings.getReminders}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Legend */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-3">{strings.legend}</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500 inline-block" />
              <span className="text-sm text-gray-600">{strings.garbage}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 inline-block" />
              <span className="text-sm text-gray-600">{strings.recycling}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 inline-block" />
              <span className="text-sm text-gray-600">{strings.bulky}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">{strings.holidayNote}</p>
        </div>

        {/* Upcoming pickups */}
        <UpcomingPickups lang={lang} />

        {/* Full year calendar */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{strings.fullSchedule}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <Calendar key={i + 1} year={2026} month={i + 1} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-800 text-white rounded-2xl p-6 text-center shadow">
          <h3 className="text-xl font-bold mb-2">{strings.neverMiss}</h3>
          <p className="text-blue-200 mb-4 text-sm">{strings.signUpCta}</p>
          <Link
            href={`/subscribe${lang !== "en" ? `?lang=${lang}` : ""}`}
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-3 rounded-full transition inline-block"
          >
            🔔 {strings.signUpBtn}
          </Link>
        </div>

        {/* Share */}
        <div className="bg-white rounded-2xl shadow p-5 text-center">
          <h3 className="font-bold text-gray-800 mb-1">{strings.shareTitle}</h3>
          <p className="text-sm text-gray-500 mb-4">{strings.shareText} trashreminder.info</p>
          <ShareButtons lang={lang} />
        </div>

        <footer className="text-center text-xs text-gray-400 pb-4">
          {strings.footer}
          <br />
          {strings.footerPhone}
        </footer>
      </div>
    </main>
  );
}
