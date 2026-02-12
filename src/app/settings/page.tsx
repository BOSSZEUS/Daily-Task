import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReminderSettings from "@/components/ReminderSettings";
import type { ReminderSchedule } from "@/lib/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: schedule } = await supabase
    .from("reminder_schedules")
    .select("*")
    .eq("user_id", user.id)
    .single() as { data: ReminderSchedule | null };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Reminder Settings</h1>
            <p className="text-sm text-zinc-500">Configure your email nudges</p>
          </div>
          <a
            href="/dashboard"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            Back to Dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <ReminderSettings userId={user.id} userEmail={user.email ?? ""} initialSchedule={schedule} />
      </main>
    </div>
  );
}
