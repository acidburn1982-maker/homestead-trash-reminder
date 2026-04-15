import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { name, email, phone, channels } = await req.json();

  if (!channels || channels.length === 0) {
    return NextResponse.json({ error: "Select at least one notification method." }, { status: 400 });
  }
  if (channels.includes("email") && !email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (channels.includes("sms") && !phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  const { error } = await getSupabase().from("subscribers").upsert(
    { name, email: email || null, phone: phone || null, channels },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
