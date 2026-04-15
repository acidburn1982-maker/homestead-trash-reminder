"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubscribePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function toggleChannel(c: string) {
    setChannels((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (channels.length === 0) {
      setMessage("Please select at least one notification method.");
      setStatus("error");
      return;
    }
    if (channels.includes("email") && !email) {
      setMessage("Please enter your email address.");
      setStatus("error");
      return;
    }
    if (channels.includes("sms") && !phone) {
      setMessage("Please enter your phone number.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, channels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      setMessage("You're signed up! You'll get reminders the night before each pickup.");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You&apos;re all set!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/" className="text-blue-700 font-semibold hover:underline">
            ← Back to schedule
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white py-6 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">← Back</Link>
          <h1 className="text-lg font-bold">Get Pickup Reminders</h1>
          <span />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-600 text-sm mb-6">
            Sign up once and we&apos;ll remind you the night before each garbage, recycling, or bulky
            waste pickup — so you never forget to take out the trash again!
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Garcia"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Notification method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How do you want to be reminded?
              </label>
              <div className="flex gap-3">
                {["email", "sms"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition ${
                      channels.includes(c)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {c === "email" ? "📧 Email" : "📱 Text Message"}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            {channels.includes("email") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            {/* Phone */}
            {channels.includes("sms") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
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

            {/* Error */}
            {status === "error" && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-blue-800 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-full transition"
            >
              {status === "loading" ? "Signing up..." : "🔔 Sign Me Up"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Free service for Zone 14 residents. You can unsubscribe anytime.
          </p>
        </div>
      </div>
    </main>
  );
}
