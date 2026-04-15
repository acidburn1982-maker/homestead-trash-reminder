"use client";

import { useState } from "react";
import Link from "next/link";
import { t, Language, LANGUAGES } from "@/lib/i18n";

const LANG_FLAGS: Record<Language, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  ht: "🇭🇹",
};

const CHANNEL_KEYS = ["email", "sms", "whatsapp"] as const;

export default function SubscribePage() {
  const [lang, setLang] = useState<Language>("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [reminderTime, setReminderTime] = useState<"evening" | "morning">("evening");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const s = t[lang] || t.en;
  const needsPhone = channels.includes("sms") || channels.includes("whatsapp");

  function toggleChannel(c: string) {
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (channels.length === 0) { setErrorMsg(s.selectChannel); setStatus("error"); return; }
    if (channels.includes("email") && !email) { setErrorMsg(s.emailRequired); setStatus("error"); return; }
    if (needsPhone && !phone) { setErrorMsg(s.phoneRequired); setStatus("error"); return; }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, channels, language: lang, reminder_time: reminderTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{s.successTitle}</h2>
          <p className="text-gray-600 mb-6">{s.successMsg}</p>
          <Link href="/" className="text-blue-700 font-semibold hover:underline">{s.back}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white py-6 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="text-blue-200 hover:text-white text-sm shrink-0">{s.back}</Link>
          <h1 className="text-lg font-bold text-center">{s.getPickupReminders}</h1>
          {/* Language toggle */}
          <div className="flex gap-1 shrink-0">
            {(Object.keys(LANGUAGES) as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  lang === l ? "bg-white text-blue-800" : "text-blue-200 hover:text-white"
                }`}
              >
                {LANG_FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-600 text-sm mb-6">{s.subscribeDesc}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{s.yourName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={s.namePlaceholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Notification channels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{s.howReminded}</label>
              <div className="flex gap-2">
                {CHANNEL_KEYS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                      channels.includes(c)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {s[c]}
                  </button>
                ))}
              </div>
            </div>

            {/* Email input */}
            {channels.includes("email") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{s.emailAddress}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {/* Phone input (SMS or WhatsApp) */}
            {needsPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {channels.includes("whatsapp") && !channels.includes("sms") ? s.whatsappNumber : s.phoneNumber}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (305) 555-0000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {/* Reminder time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{s.whenRemind}</label>
              <div className="flex gap-2">
                {(["evening", "morning"] as const).map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setReminderTime(time)}
                    className={`flex-1 py-2 rounded-lg border-2 text-xs font-semibold transition ${
                      reminderTime === time
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {s[time]}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {status === "error" && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-blue-800 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-full transition"
            >
              {status === "loading" ? s.signingUp : `🔔 ${s.signMeUp}`}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">{s.freeService}</p>
          {needsPhone && (
            <p className="text-xs text-gray-400 text-center mt-1">{s.stopSms}</p>
          )}
        </div>
      </div>
    </main>
  );
}
