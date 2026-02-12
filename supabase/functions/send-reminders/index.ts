// Supabase Edge Function: send-reminders
// Triggered by a cron job every 15 minutes.
// Checks reminder_schedules and sends emails via Resend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:3000";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Task Tracker <reminders@yourdomain.com>";

Deno.serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all active reminder schedules
    const { data: schedules, error } = await supabase
      .from("reminder_schedules")
      .select("*, profiles(display_name)")
      .eq("is_active", true);

    if (error) throw error;
    if (!schedules || schedules.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const schedule of schedules) {
      // Get current time in the user's timezone
      const now = new Date();
      const userTime = new Date(
        now.toLocaleString("en-US", { timeZone: schedule.timezone })
      );
      const currentDay = userTime.getDay();
      const currentHour = userTime.getHours();
      const currentMinute = userTime.getMinutes();

      // Check if current day matches
      if (!schedule.days_of_week.includes(currentDay)) continue;

      // Check if any scheduled time matches within a 15-min window
      const shouldSend = schedule.times.some((time: string) => {
        const [h, m] = time.split(":").map(Number);
        const scheduledMinutes = h * 60 + m;
        const currentMinutes = currentHour * 60 + currentMinute;
        return (
          currentMinutes >= scheduledMinutes &&
          currentMinutes < scheduledMinutes + 15
        );
      });

      if (!shouldSend) continue;

      // Avoid duplicate sends: skip if last_sent_at is within the last 14 minutes
      if (schedule.last_sent_at) {
        const lastSent = new Date(schedule.last_sent_at);
        const diffMs = now.getTime() - lastSent.getTime();
        if (diffMs < 14 * 60 * 1000) continue;
      }

      // Send email via Resend
      const displayName =
        schedule.profiles?.display_name || "there";

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [schedule.email_to],
          subject: "What have you accomplished lately?",
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
              <h2 style="color: #18181b; margin-bottom: 8px;">Hey ${displayName}!</h2>
              <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                What have you accomplished in the last few hours? Take a moment to log it.
              </p>
              <a href="${APP_URL}/dashboard"
                 style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #18181b; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Log an accomplishment
              </a>
              <p style="color: #a1a1aa; font-size: 13px; margin-top: 24px;">
                You're receiving this because you set up reminders in Task Tracker.
              </p>
            </div>
          `,
        }),
      });

      if (res.ok) {
        // Update last_sent_at
        await supabase
          .from("reminder_schedules")
          .update({ last_sent_at: now.toISOString() })
          .eq("id", schedule.id);
        sentCount++;
      }
    }

    return new Response(JSON.stringify({ sent: sentCount }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
