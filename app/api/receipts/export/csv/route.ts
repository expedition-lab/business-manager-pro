// app/api/receipts/export/csv/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requirePlan } from "@/app/api/lib/requirePlan";

export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Export reserved for Business and above:
  await requirePlan(user.id, "business");

  const { data, error } = await sb
    .from("receipts")
    .select("created_at, ref, client_name, total, currency, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data || [];
  const header = ["created_at","ref","client_name","total","currency","status"];
  const csv = [
    header.join(","),
    ...rows.map(r => header.map(k => {
      const v = (r as any)[k] ?? "";
      // basic CSV escape
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(","))
  ].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="receipts.csv"`,
    },
  });
}
