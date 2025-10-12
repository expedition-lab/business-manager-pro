// app/api/receipts/export/csv/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkPlanAndQuota } from "@/app/api/lib/requirePlan";

export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check plan - CSV export reserved for Business plan
  const planCheck = await checkPlanAndQuota();
  if (!planCheck.ok) {
    return NextResponse.json(
      { error: planCheck.reason || "Plan check failed" },
      { status: 402 }
    );
  }
  
  // Additional check: must be Business plan for CSV export
  if (planCheck.plan?.plan !== "business") {
    return NextResponse.json(
      { error: "CSV export is only available on the Business plan. Please upgrade." },
      { status: 402 }
    );
  }

  const { data, error } = await sb
    .from("receipts")
    .select("created_at, reference_number, client_name, total, payment_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data || [];
  const header = ["created_at", "reference_number", "client_name", "total", "payment_status"];
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
      "Content-Disposition": `attachment; filename="receipts-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
