"use client";

import { useState } from "react";
import type { Category, Entry } from "@/lib/types/database";

interface ShareModalProps {
  categories: Category[];
  entries: Entry[];
  onClose: () => void;
}

function generateHtml(categories: Category[], entries: Entry[]): string {
  let html = `<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">`;
  html += `<h1 style="color: #18181b; border-bottom: 2px solid #e4e4e7; padding-bottom: 12px;">Task Tracker</h1>`;

  for (const cat of categories) {
    const catEntries = entries
      .filter((e) => e.category_id === cat.id)
      .sort(
        (a, b) =>
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );

    if (catEntries.length === 0) continue;

    html += `<h2 style="color: #27272a; margin-top: 24px;">${cat.name}</h2>`;
    html += `<ul style="padding-left: 20px;">`;
    for (const entry of catEntries) {
      html += `<li style="color: #3f3f46; margin-bottom: 6px;"><strong>${entry.entry_date}</strong> &mdash; ${entry.content}</li>`;
    }
    html += `</ul>`;
  }

  html += `<p style="color: #a1a1aa; font-size: 13px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 12px;">Shared from Task Tracker</p>`;
  html += `</div>`;
  return html;
}

export default function ShareModal({
  categories,
  entries,
  onClose,
}: ShareModalProps) {
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const toList = emails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (toList.length === 0) {
      setError("Enter at least one email address");
      setSending(false);
      return;
    }

    const html = generateHtml(categories, entries);

    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: toList,
        subject: "Task Tracker — Shared Report",
        html,
      }),
    });

    if (res.ok) {
      setSent(true);
      setTimeout(() => onClose(), 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send");
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">
            Share via Email
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <p className="font-medium text-green-800">Sent!</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Send to (comma-separated)
              </label>
              <input
                type="text"
                placeholder="manager@company.com, teammate@company.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <p className="text-xs text-zinc-400">
              Your complete task tracker report will be sent as a formatted
              email.
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
