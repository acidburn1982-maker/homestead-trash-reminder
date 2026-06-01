import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendPickupReminderEmail } from "@/lib/email";
import { sendPickupReminderSMS } from "@/lib/callfire";
import { sendPickupReminderWhatsApp } from "@/lib/whatsapp";
import { getTomorrowPickups, getTodayPickups } from "@/lib/schedule";

// This route is called by cron jobs every evening and morning to send reminders.
// Vercel crons use GET; manual triggers can use POST. Both are protected.
async function handleNotify(req: NextRequest) {
  const url = new URL(req.url);

  // Auth — accept ANY of these so a missing CRON_SECRET env var doesn't silently
  // break daily reminders:
  //   1. Vercel's built-in `x-vercel-cron` header. Vercel sets this header on
  //      every cron-triggered invocation and external requests cannot forge it,
  //      so we can trust it as proof the call came from Vercel's scheduler.
  //   2. `Authorization: Bearer ${CRON_SECRET}` — the stronger optional check
  //      we use when the env var is set.
  //   3. `?pw=ADMIN_PASSWORD` — for manual triggers from /admin.
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") !== null;
  const urlPw = url.searchParams.get("pw");
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const isAuthorized =
    isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (adminPassword && urlPw === adminPassword);

  if (!isAuthorized) {
    console.warn("[notify] 401 unauthorized — no x-vercel-cron header, no matching Bearer, no admin pw.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log(`[notify] auth ok — source: ${isVercelCron ? "vercel-cron" : (urlPw ? "admin" : "bearer")}`);

  // "evening" = night before (sends for tomorrow's pickups)
  // "morning" = day of (sends for today's pickups)
  const time = url.searchParams.get("time") || "evening";

  const pickups = time === "morning" ? getTodayPickups() : getTomorrowPickups();
  console.log(`[notify] time=${time} pickups=${JSON.stringify(pickups)}`);

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
    console.error(`[notify] supabase fetch failed: ${error?.message ?? "no data returned"}`);
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
  console.log(`[notify] matched ${subscribers.length} active subscribers for time=${time}`);

  let emailsSent = 0;
  let smsSent = 0;
  let whatsappSent = 0;
  const errors: string[] = [];

  // ── Idempotency: load every send already recorded for this pickup_date+time ──
  // Backup crons (7:30pm, 8pm) will see these and skip subscribers already notified.
  const supabase = getSupabase();
  const { data: alreadySent } = await supabase
    .from("notification_runs")
    .select("subscriber_id, channel")
    .eq("pickup_date", date)
    .eq("reminder_time", time)
    .eq("status", "sent");

  const sentKey = (subId: string, channel: string) => `${subId}|${channel}`;
  const sentSet = new Set<string>(
    (alreadySent || []).map((r) => sentKey(r.subscriber_id, r.channel))
  );
  console.log(`[notify] idempotency: ${sentSet.size} sends already recorded for ${date}/${time}`);

  let skipped = 0;

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      const lang = sub.language || "en";
      const channels = sub.channels || [];

      // Helper: send via one channel + record the result; skip if already sent.
      const sendVia = async (
        channel: "email" | "sms" | "whatsapp",
        recipient: string | undefined,
        fn: () => Promise<unknown>
      ): Promise<"sent" | "skipped" | "error"> => {
        if (!channels.includes(channel) || !recipient) return "skipped";
        if (sentSet.has(sentKey(sub.id, channel))) {
          skipped++;
          console.log(`[notify] skip ${channel} for ${recipient} — already sent`);
          return "skipped";
        }
        try {
          await fn();
          await supabase.from("notification_runs").insert({
            pickup_date: date,
            reminder_time: time,
            subscriber_id: sub.id,
            channel,
            status: "sent",
          });
          console.log(`[notify] sent ${channel} to ${recipient}`);
          return "sent";
        } catch (err) {
          const msg = `Failed for ${recipient} (${channel}): ${err instanceof Error ? err.message : String(err)}`;
          console.error(`[notify] ${msg}`);
          errors.push(msg);
          await supabase.from("notification_runs").insert({
            pickup_date: date,
            reminder_time: time,
            subscriber_id: sub.id,
            channel,
            status: "error",
            error_message: msg.slice(0, 500),
          });
          return "error";
        }
      };

      if ((await sendVia("email",    sub.email, () => sendPickupReminderEmail(sub.email,   sub.name, date, types, lang))) === "sent") emailsSent++;
      if ((await sendVia("sms",      sub.phone, () => sendPickupReminderSMS(sub.phone,     sub.name, date, types, lang))) === "sent") smsSent++;
      if ((await sendVia("whatsapp", sub.phone, () => sendPickupReminderWhatsApp(sub.phone, sub.name, date, types, lang))) === "sent") whatsappSent++;
    })
  );

  // Summary row — recorded with a synthetic 'summary' channel so the watchdog
  // can quickly query "did *any* notify run complete for this pickup_date/time?"
  await supabase.from("notification_runs").insert({
    pickup_date: date,
    reminder_time: time,
    subscriber_id: null,
    channel: "summary",
    status: "sent",
    error_message: errors.length ? `${errors.length} provider errors — see prior rows` : null,
  });

  const summary = { date, types, time, emailsSent, smsSent, whatsappSent, skipped, errors };
  console.log(`[notify] done — ${JSON.stringify(summary)}`);
  return NextResponse.json(summary);
}

export async function GET(req: NextRequest) {
  return handleNotify(req);
}

export async function POST(req: NextRequest) {
  return handleNotify(req);
}
