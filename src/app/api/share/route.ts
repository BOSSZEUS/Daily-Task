import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, html } = await request.json();

  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, html" },
      { status: 400 }
    );
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL =
    process.env.FROM_EMAIL || "Task Tracker <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email sending is not configured. Set RESEND_API_KEY." },
      { status: 500 }
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: "Failed to send email", details: err },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
