import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendPickupReminderEmail } from "@/lib/email";
import { sendPickupReminderSMS } from "@/lib/sms";
import { sendPickupReminderWhatsApp } from "@/lib/whatsapp";
import { getTomorrowPickups, getTodayPickups } from "@/lib/schedule";

// This route is called by cron jobs every evening and morning to send reminders.
// Vercel crons use GET; manual triggers can use POST. Both are protected.
async function handleNotify(req: NextRequest) {
  const url = new URL(req.url);

  // Auth: accept Bearer CRON_SECRET or admin password in ?pw= query param
  const authHeader = req.headers.get("authorization");
  const urlPw = url.searchParams.get("pw");
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (adminPassword && urlPw === adminPassword);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // "evening" = night before (sends for tomorrow's pickups)
  // "morning" = day of (sends for today's pickups)
  const time = url.searchParams.get("time") || "evening";

  const pickups = time === "morning" ? getTodayPickups() : getTomorrowPickups();

  if (pickups.length === 0) {
    return NextResponse.json({ message: `No pickups ${time === "morning" ? "today" : "tomorrow"}. No notifications sent.` });
  }

  const { date, types } = pickups[0];

  // Fetch active subscribers for this reminder time window
  const { data: subscribers, error } = await getSupabase()
    .from("subscribers")
    .select("*")
    .eq("active", true)
    .eq("reminder_time", time);

  if (error || !subscribers) {
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }

  let emailsSent = 0;
  let smsSent = 0;
  let whatsappSent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      const lang = sub.language || "en";
      try {
        if (sub.channels.includes("email") && sub.email) {
          await sendPickupReminderEmail(sub.email, sub.name, date, types, lang);
          emailsSent++;
        }
        if (sub.channels.includes("sms") && sub.phone) {
          await sendPickupReminderSMS(sub.phone, sub.name, date, types, lang);
          smsSent++;
        }
        if (sub.channels.includes("whatsapp") && sub.phone) {
          await sendPickupReminderWhatsApp(sub.phone, sub.name, date, types, lang);
          whatsappSent++;
        }
      } catch (err) {
        errors.push(`Failed for ${sub.email || sub.phone}: ${err}`);
      }
    })
  );

  return NextResponse.json({
    date,
    types,
    time,
    emailsSent,
    smsSent,
    whatsappSent,
    errors,
  });
}

export async function GET(req: NextRequest) {
  return handleNotify(req);
}

export async function POST(req: NextRequest) {
  return handleNotify(req);
}
