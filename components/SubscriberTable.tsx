"use client";

import { useMemo, useState } from "react";

export interface Subscriber {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  channels: string[] | null;
  language: string | null;
  reminder_time: string | null;
  active: boolean;
  created_at: string;
}

interface Props {
  subscribers: Subscriber[];
  adminPw: string;
}

type StatusFilter = "all" | "active" | "inactive";
type ChannelFilter = "all" | "email" | "sms" | "whatsapp";
type LangFilter = "all" | "en" | "es" | "ht";

export default function SubscriberTable({ subscribers, adminPw }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [langFilter, setLangFilter] = useState<LangFilter>("all");
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<Subscriber[]>(subscribers);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((s) => {
      if (statusFilter === "active" && !s.active) return false;
      if (statusFilter === "inactive" && s.active) return false;
      if (channelFilter !== "all" && !(s.channels || []).includes(channelFilter)) return false;
      if (langFilter !== "all" && (s.language || "en") !== langFilter) return false;
      if (term) {
        const hay = [s.name, s.email, s.phone].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [list, search, statusFilter, channelFilter, langFilter]);

  async function deleteSub(sub: Subscriber) {
    if (!confirm(`Delete ${sub.name || sub.email || sub.phone}? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/subscribers?pw=${encodeURIComponent(adminPw)}&id=${sub.id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (res.ok) {
      setList((prev) => prev.filter((s) => s.id !== sub.id));
    } else {
      alert("Failed to delete.");
    }
  }

  async function saveEdit(updated: Subscriber) {
    setBusy(true);
    const res = await fetch(`/api/admin/subscribers?pw=${encodeURIComponent(adminPw)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: updated.id,
        updates: {
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          channels: updated.channels,
          language: updated.language,
          reminder_time: updated.reminder_time,
          active: updated.active,
        },
      }),
    });
    setBusy(false);
    if (res.ok) {
      setList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditing(null);
    } else {
      alert("Failed to save.");
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-gray-800">Subscribers ({filtered.length})</h2>
        <a
          href={`/api/admin/export?pw=${encodeURIComponent(adminPw)}`}
          className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-full"
        >
          ⬇ Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Unsubscribed</option>
        </select>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as ChannelFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "en", "es", "ht"] as LangFilter[]).map((l) => (
          <button
            key={l}
            onClick={() => setLangFilter(l)}
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              langFilter === l
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {l === "all" ? "All langs" : l === "en" ? "🇺🇸 EN" : l === "es" ? "🇪🇸 ES" : "🇭🇹 HT"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Contact</th>
              <th className="pb-2">Channels</th>
              <th className="pb-2">Lang</th>
              <th className="pb-2">Time</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Date</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-400">
                  No subscribers match these filters.
                </td>
              </tr>
            )}
            {filtered.map((sub) => (
              <tr key={sub.id} className="text-gray-700">
                <td className="py-2">{sub.name || "—"}</td>
                <td className="py-2 text-xs">{sub.email || sub.phone || "—"}</td>
                <td className="py-2 text-xs">{(sub.channels || []).join(", ")}</td>
                <td className="py-2">{sub.language || "en"}</td>
                <td className="py-2 text-xs">{sub.reminder_time || "evening"}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sub.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {sub.active ? "Active" : "Off"}
                  </span>
                </td>
                <td className="py-2 text-xs text-gray-400">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditing(sub)}
                    className="text-blue-700 hover:underline text-xs font-semibold mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSub(sub)}
                    className="text-red-600 hover:underline text-xs font-semibold"
                    disabled={busy}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal
          subscriber={editing}
          onCancel={() => setEditing(null)}
          onSave={saveEdit}
          busy={busy}
        />
      )}
    </div>
  );
}

function EditModal({
  subscriber,
  onCancel,
  onSave,
  busy,
}: {
  subscriber: Subscriber;
  onCancel: () => void;
  onSave: (s: Subscriber) => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState<Subscriber>({ ...subscriber, channels: subscriber.channels || [] });

  function toggleChannel(c: string) {
    const current = draft.channels || [];
    setDraft({
      ...draft,
      channels: current.includes(c) ? current.filter((x) => x !== c) : [...current, c],
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Subscriber</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={draft.name || ""}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={draft.email || ""}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
            <input
              type="tel"
              value={draft.phone || ""}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Channels</label>
            <div className="flex gap-2">
              {["email", "sms", "whatsapp"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={`flex-1 py-1 rounded-lg border-2 text-xs font-semibold ${
                    (draft.channels || []).includes(c)
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Language</label>
              <select
                value={draft.language || "en"}
                onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="ht">Kreyòl</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reminder time</label>
              <select
                value={draft.reminder_time || "evening"}
                onChange={(e) => setDraft({ ...draft, reminder_time: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="evening">Evening (8pm)</option>
                <option value="morning">Morning (7am)</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            />
            Active (receives reminders)
          </label>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={busy}
            className="flex-1 bg-blue-800 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 rounded-full"
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
