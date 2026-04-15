import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendPickupReminderEmail } from "@/lib/email";
import { sendPickupReminderSMS } from "@/lib/sms";
import { getTomorrowPickups } from "@/lib/schedule";

// This route is called by a cron job every evening to send reminders.
// Vercel crons use GET; manual triggers can use POST. Both are protected.
async function handleNotify(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrowPickups = getTomorrowPickups();
  if (tomorrowPickups.length === 0) {
    return NextResponse.json({ message: "No pickups tomorrow. No notifications sent." });
  }

  const { date, types } = tomorrowPickups[0];

  // Fetch all active subscribers
  const { data: subscribers, error } = await getSupabase()
    .from("subscribers")
    .select("*")
    .eq("active", true);

  if (error || !subscribers) {
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }

  let emailsSent = 0;
  let smsSent = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      try {
        if (sub.channels.includes("email") && sub.email) {
          await sendPickupReminderEmail(sub.email, sub.name, date, types);
          emailsSent++;
        }
        if (sub.channels.includes("sms") && sub.phone) {
          await sendPickupReminderSMS(sub.phone, sub.name, date, types);
          smsSent++;
        }
      } catch (err) {
        errors.push(`Failed for ${sub.email || sub.phone}: ${err}`);
      }
    })
  );

  return NextResponse.json({
    date,
    types,
    emailsSent,
    smsSent,
    errors,
  });
}

export async function GET(req: NextRequest) {
  return handleNotify(req);
}

export async function POST(req: NextRequest) {
  return handleNotify(req);
}
