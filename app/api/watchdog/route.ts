import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";
import { getTomorrowPickups, getTodayPickups, PICKUP_LABELS } from "@/lib/schedule";

// Watchdog cron — runs at 01:00 UTC (9pm EDT) every night.
// Checks whether the evening reminder run succeeded today. If not, sends an
// alert email to ADMIN_NOTIFY_EMAIL so the operator can investigate before
// subscribers wake up missing their reminder.
async function handleWatchdog(req: NextRequest) {
  const url = new URL(req.url);

  // Same multi-path auth as /api/notify.
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
    console.warn("[watchdog] 401 unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  // Today and tomorrow's expected pickups
  const todayPickups = getTodayPickups();
  const tomorrowPickups = getTomorrowPickups();

  // The evening run earlier tonight should have notified subscribers about
  // tomorrow's pickup. If tomorrow has no pickup, nothing was expected; bail.
  if (tomorrowPickups.length === 0) {
    console.log("[watchdog] no pickup tomorrow — nothing to verify");
    return NextResponse.json({ message: "No pickup tomorrow. Watchdog has nothing to verify." });
  }

  const expectedDate = tomorrowPickups[0].date;

  // Was there a successful summary run for this expected pickup_date+evening?
  const { data: runs, error } = await supabase
    .from("notification_runs")
    .select("id, channel, status, error_message, created_at")
    .eq("pickup_date", expectedDate)
    .eq("reminder_time", "evening")
    .eq("channel", "summary")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error(`[watchdog] supabase error: ${error.message}`);
    await alertAdmin(
      "Watchdog DB error",
      `Watchdog could not verify tonight's reminder run for ${expectedDate}.\n\nSupabase error: ${error.message}\n\nManually trigger /admin and click "Send Evening Reminders" to recover.`
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ranOk = (runs || []).some((r) => r.status === "sent");

  if (ranOk) {
    console.log(`[watchdog] OK — evening run for ${expectedDate} completed`);
    return NextResponse.json({ ok: true, expectedDate, runs });
  }

  // No successful evening run on file — alert the admin.
  const typesLabel = tomorrowPickups[0].types.map((t) => PICKUP_LABELS[t]).join(", ");
  const subject = `⚠️ Trash reminder FAILED for ${expectedDate} (${typesLabel})`;
  const body =
    `The watchdog ran at ${new Date().toISOString()} and found no successful evening reminder ` +
    `for the ${expectedDate} pickup (${typesLabel}).\n\n` +
    `Recent recorded attempts:\n` +
    JSON.stringify(runs || [], null, 2) +
    `\n\nRecover immediately by:\n` +
    `  • Opening /admin and clicking "Send Evening Reminders", OR\n` +
    `  • curl https://www.trashreminder.info/api/notify?time=evening&pw=YOUR_PW\n\n` +
    `Today (${todayPickups[0]?.date || "no pickup"}) had: ${todayPickups[0]?.types?.map((t) => PICKUP_LABELS[t]).join(", ") || "—"}.`;

  await alertAdmin(subject, body);

  return NextResponse.json({
    ok: false,
    alerted: true,
    expectedDate,
    runs,
  });
}

async function alertAdmin(subject: string, body: string) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  const from = process.env.FROM_EMAIL || "reminders@homesteadtrash.com";
  const apiKey = process.env.RESEND_API_KEY;

  if (!to || !apiKey) {
    console.error(
      `[watchdog] cannot send alert — ${!to ? "ADMIN_NOTIFY_EMAIL not set" : ""} ${!apiKey ? "RESEND_API_KEY not set" : ""}`
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject,
      text: body,
    });
    console.log(`[watchdog] alert sent to ${to}`);
  } catch (err) {
    console.error(`[watchdog] alert send failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function GET(req: NextRequest) {
  return handleWatchdog(req);
}

export async function POST(req: NextRequest) {
  return handleWatchdog(req);
}
