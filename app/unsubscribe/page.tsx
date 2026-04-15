"use client";

import { useState } from "react";
import Link from "next/link";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You&apos;ve been unsubscribed</h2>
          <p className="text-gray-500 mb-6 text-sm">
            You won&apos;t receive any more reminders. You can always sign up again if you change your mind.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/subscribe"
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 rounded-full transition text-sm"
            >
              Sign up again
            </Link>
            <Link href="/" className="text-blue-700 hover:underline text-sm">
              ← Back to schedule
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white py-6 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">← Back</Link>
          <h1 className="text-lg font-bold">Unsubscribe</h1>
          <span />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-600 text-sm mb-6">
            Sorry to see you go! Enter your email below and you&apos;ll be removed from all reminders immediately.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {status === "error" && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-full transition"
            >
              {status === "loading" ? "Removing..." : "Unsubscribe"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            For SMS, reply <strong>STOP</strong> to any reminder text message.
          </p>
        </div>
      </div>
    </main>
  );
}
