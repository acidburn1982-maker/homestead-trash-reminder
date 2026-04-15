import Calendar from "@/components/Calendar";
import UpcomingPickups from "@/components/UpcomingPickups";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">🗑️ Homestead Trash Reminder</h1>
            <p className="text-blue-200 text-sm mt-1">Zone 14 · City of Homestead, FL · 2026</p>
          </div>
          <Link
            href="/subscribe"
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-5 py-2 rounded-full transition text-sm whitespace-nowrap"
          >
            🔔 Get Reminders
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Legend */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Legend</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500 inline-block" />
              <span className="text-sm text-gray-600">Garbage (Mon &amp; Thu)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 inline-block" />
              <span className="text-sm text-gray-600">Recycling</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500 inline-block" />
              <span className="text-sm text-gray-600">Bulky Waste</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * No garbage service on Jan 19 (MLK Day), Jun 19 (Juneteenth), Dec 25 (Christmas)
          </p>
        </div>

        {/* Upcoming pickups */}
        <UpcomingPickups />

        {/* Full year calendar */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">2026 Full Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <Calendar key={i + 1} year={2026} month={i + 1} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-800 text-white rounded-2xl p-6 text-center shadow">
          <h3 className="text-xl font-bold mb-2">Never miss a pickup!</h3>
          <p className="text-blue-200 mb-4 text-sm">
            Sign up to get a reminder the night before by email or text message.
          </p>
          <Link
            href="/subscribe"
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-3 rounded-full transition inline-block"
          >
            🔔 Sign Up for Reminders — It&apos;s Free
          </Link>
        </div>

        <footer className="text-center text-xs text-gray-400 pb-4">
          Serving Zone 14 · Homestead, FL · Not affiliated with the City of Homestead
          <br />
          Questions? Call 305.224.4660 (Garbage) or 305.224.4663 (Bulky)
        </footer>
      </div>
    </main>
  );
}
