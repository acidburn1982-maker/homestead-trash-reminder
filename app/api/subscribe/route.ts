import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { name, email, phone, channels, language, reminder_time } = await req.json();

  if (!channels || channels.length === 0) {
    return NextResponse.json({ error: "Select at least one notification method." }, { status: 400 });
  }
  if (channels.includes("email") && !email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if ((channels.includes("sms") || channels.includes("whatsapp")) && !phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const db = getSupabase();
  let error;

  if (email) {
    // Email subscriber — upsert so re-registration updates preferences
    ({ error } = await db.from("subscribers").upsert(
      {
        name,
        email,
        phone: phone || null,
        channels,
        language: language || "en",
        reminder_time: reminder_time || "evening",
        active: true,
      },
      { onConflict: "email" }
    ));
  } else {
    // Phone-only subscriber (SMS/WhatsApp only)
    ({ error } = await db.from("subscribers").insert({
      name,
      phone,
      channels,
      language: language || "en",
      reminder_time: reminder_time || "evening",
    }));
  }

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
