import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getStats() {
  const db = getSupabase();
  const { data: subscribers } = await db
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  const all = subscribers || [];
  const active = all.filter((s) => s.active);

  return {
    total: all.length,
    active: active.length,
    email: active.filter((s) => s.channels?.includes("email")).length,
    sms: active.filter((s) => s.channels?.includes("sms")).length,
    whatsapp: active.filter((s) => s.channels?.includes("whatsapp")).length,
    english: active.filter((s) => s.language === "en" || !s.language).length,
    spanish: active.filter((s) => s.language === "es").length,
    creole: active.filter((s) => s.language === "ht").length,
    evening: active.filter((s) => s.reminder_time === "evening" || !s.reminder_time).length,
    morning: active.filter((s) => s.reminder_time === "morning").length,
    recent: all.slice(0, 10),
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ pw?: string }>;
}) {
  const params = await searchParams;
  const pw = params.pw;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || pw !== adminPassword) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">← Site</Link>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <span className="text-blue-200 text-sm">Zone 14</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Signups", value: stats.total, color: "bg-blue-800" },
            { label: "Active", value: stats.active, color: "bg-green-600" },
            { label: "Unsubscribed", value: stats.total - stats.active, color: "bg-gray-500" },
            { label: "Email", value: stats.email, color: "bg-yellow-600" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} text-white rounded-2xl p-5 text-center shadow`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm mt-1 opacity-80">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Channels */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-gray-800 mb-4">Notification Channels</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold text-blue-700">{stats.email}</div><div className="text-sm text-gray-500">📧 Email</div></div>
            <div><div className="text-2xl font-bold text-green-700">{stats.sms}</div><div className="text-sm text-gray-500">📱 SMS</div></div>
            <div><div className="text-2xl font-bold text-teal-700">{stats.whatsapp}</div><div className="text-sm text-gray-500">💬 WhatsApp</div></div>
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-gray-800 mb-4">Languages</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><div className="text-2xl font-bold text-gray-800">{stats.english}</div><div className="text-sm text-gray-500">🇺🇸 English</div></div>
            <div><div className="text-2xl font-bold text-gray-800">{stats.spanish}</div><div className="text-sm text-gray-500">🇪🇸 Spanish</div></div>
            <div><div className="text-2xl font-bold text-gray-800">{stats.creole}</div><div className="text-sm text-gray-500">🇭🇹 Kreyòl</div></div>
          </div>
        </div>

        {/* Reminder time */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-gray-800 mb-4">Reminder Time Preference</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div><div className="text-2xl font-bold text-gray-800">{stats.evening}</div><div className="text-sm text-gray-500">🌙 Night before (8pm)</div></div>
            <div><div className="text-2xl font-bold text-gray-800">{stats.morning}</div><div className="text-sm text-gray-500">☀️ Morning of (7am)</div></div>
          </div>
        </div>

        {/* Recent signups */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-gray-800 mb-4">Recent Signups</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Contact</th>
                  <th className="pb-2">Channels</th>
                  <th className="pb-2">Lang</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recent.map((sub: {
                  id: string;
                  name: string;
                  email: string;
                  phone: string;
                  channels: string[];
                  language: string;
                  active: boolean;
                  created_at: string;
                }) => (
                  <tr key={sub.id} className="text-gray-700">
                    <td className="py-2">{sub.name || "—"}</td>
                    <td className="py-2 text-xs">{sub.email || sub.phone || "—"}</td>
                    <td className="py-2">{(sub.channels || []).join(", ")}</td>
                    <td className="py-2">{sub.language || "en"}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sub.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {sub.active ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="py-2 text-xs text-gray-400">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual trigger */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <h2 className="font-bold text-gray-800 mb-2">Send Reminders Now</h2>
          <p className="text-sm text-gray-600 mb-3">Manually trigger reminders (only sends if there&apos;s a pickup tomorrow/today).</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/notify?time=evening&pw=${encodeURIComponent(pw || "")}`}
              className="bg-blue-800 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-full inline-block"
            >
              🌙 Send Evening Reminders
            </a>
            <a
              href={`/api/notify?time=morning&pw=${encodeURIComponent(pw || "")}`}
              className="bg-green-700 hover:bg-green-600 text-white text-sm font-bold px-5 py-2 rounded-full inline-block"
            >
              ☀️ Send Morning Reminders
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
