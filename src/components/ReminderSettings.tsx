"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReminderSchedule } from "@/lib/types/database";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
];

interface ReminderSettingsProps {
  userId: string;
  userEmail: string;
  initialSchedule: ReminderSchedule | null;
}

export default function ReminderSettings({
  userId,
  userEmail,
  initialSchedule,
}: ReminderSettingsProps) {
  const [emailTo, setEmailTo] = useState(initialSchedule?.email_to ?? userEmail);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialSchedule?.days_of_week ?? [1, 2, 3, 4, 5]
  );
  const [times, setTimes] = useState<string[]>(
    initialSchedule?.times ?? ["11:00", "15:00"]
  );
  const [timezone, setTimezone] = useState(
    initialSchedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isActive, setIsActive] = useState(initialSchedule?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function addTime() {
    setTimes((prev) => [...prev, "12:00"]);
  }

  function updateTime(index: number, value: string) {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function removeTime(index: number) {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const payload = {
      user_id: userId,
      email_to: emailTo,
      days_of_week: daysOfWeek,
      times,
      timezone,
      is_active: isActive,
    };

    if (initialSchedule) {
      await supabase
        .from("reminder_schedules")
        .update(payload)
        .eq("id", initialSchedule.id);
    } else {
      await supabase.from("reminder_schedules").insert(payload);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6">
      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <label className="font-medium text-zinc-900">
          Reminders enabled
        </label>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isActive ? "bg-zinc-900" : "bg-zinc-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Send reminders to
        </label>
        <input
          type="email"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        />
      </div>

      {/* Days of week */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Days
        </label>
        <div className="mt-2 flex gap-2">
          {DAY_LABELS.map((label, index) => (
            <button
              key={index}
              onClick={() => toggleDay(index)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                daysOfWeek.includes(index)
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Times */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Times
        </label>
        <div className="mt-2 space-y-2">
          {times.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => updateTime(index, e.target.value)}
                className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
              {times.length > 1 && (
                <button
                  onClick={() => removeTime(index)}
                  className="text-zinc-400 hover:text-red-500"
                >
                  <svg
                    className="h-4 w-4"
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
              )}
            </div>
          ))}
          <button
            onClick={addTime}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700"
          >
            + Add time
          </button>
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
