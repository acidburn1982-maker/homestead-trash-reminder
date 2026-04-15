import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("subscribers")
    .update({ active: false })
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: "Could not find that email. Please check and try again." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
