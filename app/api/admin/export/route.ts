import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = Array.isArray(value) ? value.join("|") : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(req: NextRequest) {
  const pw = req.nextUrl.searchParams.get("pw");
  if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await getSupabase()
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const headers = ["name", "email", "phone", "channels", "language", "reminder_time", "active", "created_at"];
  const rows = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];
  const csv = rows.join("\n");

  const today = new Date().toISOString().split("T")[0];
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="homestead-subscribers-${today}.csv"`,
    },
  });
}
