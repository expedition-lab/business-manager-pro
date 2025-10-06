import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // (Optional) verify the requesting user owns this receipt via Authorization header
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: gu } = await sb.auth.getUser(token);
  if (!gu?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: row, error } = await sb
    .from("v_receipts_print")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !row) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });

  // Build HTML
  const html = renderReceiptHTML(row);

  // If you have a PDF service or library, generate and return application/pdf
  // For MVP, return HTML so you can plug your existing PDF generator easily
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function fmt(amount?: number) {
  return typeof amount === "number" ? `Rs ${amount.toFixed(2)}` : "";
}

function renderReceiptHTML(r: any) {
  // Basic, print-friendly, CSS-inlined HTML. Replace your current template with this.
  return `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Receipt ${r.receipt_number}</title>
<style>
  :root { --fg:#0f172a; --muted:#64748b; --line:#e2e8f0; --accent:#111827; }
  *{box-sizing:border-box} body{margin:0; font:14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto; color:var(--fg);}
  .wrap{max-width:800px; margin:32px auto; padding:0 24px;}
  .row{display:flex; gap:16px;}
  .col{flex:1}
  .header{align-items:center; justify-content:space-between;}
  img.logo{height:48px; object-fit:contain}
  h1{font-size:24px; margin:4px 0 0}
  h2{font-size:16px; margin:0; color:var(--muted)}
  .card{border:1px solid var(--line); border-radius:12px; padding:16px; background:#fff;}
  .muted{color:var(--muted)}
  .title{font-weight:600}
  .grid2{display:grid; grid-template-columns:1fr 1fr; gap:16px}
  .kvs{display:grid; grid-template-columns:140px 1fr; gap:4px 12px}
  table{width:100%; border-collapse:collapse; margin-top:8px}
  th,td{padding:10px 8px; border-bottom:1px solid var(--line); text-align:left; vertical-align:top}
  th{font-weight:600; color:var(--muted)}
  .right{text-align:right}
  .totals td{border-bottom:none}
  .badge{display:inline-block; border:1px solid var(--line); border-radius:999px; padding:2px 8px; font-size:12px; color:var(--muted)}
  .footer{margin-top:16px; font-size:12px; color:var(--muted)}
</style>
</head>
<body>
  <div class="wrap">
    <div class="row header">
      <div class="col">
        ${r.logo_url ? `<img class="logo" src="${r.logo_url}" alt="${r.business_name} logo">` : `<div class="badge">${r.business_name || "Your Business"}</div>`}
        <h1>RECEIPT</h1>
        <div class="muted">Receipt #: <span class="title">${r.receipt_number || r.id}</span></div>
        <div class="muted">Date: <span class="title">${new Date(r.receipt_date).toLocaleDateString()}</span></div>
      </div>
      <div class="col" style="text-align:right">
        <div class="title" style="font-size:16px">${r.business_name || ""}</div>
        <div>${(r.business_address || "").replace(/\n/g,"<br>")}</div>
        <div>${r.business_email || ""}${r.business_phone ? " · " + r.business_phone : ""}</div>
        <div>${r.brn ? "BRN: " + r.brn : ""}${r.vat ? (r.brn ? " · " : "") + "VAT: " + r.vat : ""}</div>
      </div>
    </div>

    <div class="grid2" style="margin-top:16px">
      <div class="card">
        <div class="title" style="margin-bottom:8px">Bill to</div>
        <div>${r.client_name || "-"}</div>
        <div class="muted">${r.client_email || ""}${r.client_phone ? " · " + r.client_phone : ""}</div>
      </div>
      <div class="card">
        <div class="title" style="margin-bottom:8px">Payment</div>
        <div class="kvs">
          <div class="muted">Currency</div><div>Rs (MUR)</div>
          <div class="muted">Method</div><div><!-- e.g. Cash / JUICE / PayPal / Card --></div>
          <div class="muted">Reference</div><div><!-- txn ref / last4 --></div>
          <div class="muted">Status</div><div>PAID</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <table>
        <thead>
          <tr><th>Description</th><th class="right">Qty</th><th class="right">Unit Price</th><th class="right">Amount</th></tr>
        </thead>
        <tbody>
          ${Array.isArray(r.items) ? r.items.map((it:any) => `
            <tr>
              <td>${(it.description||"").replace(/[<>]/g,"")}</td>
              <td class="right">${it.qty ?? 1}</td>
              <td class="right">${fmt(it.unit_price)}</td>
              <td class="right">${fmt((it.qty ?? 1) * (it.unit_price ?? 0))}</td>
            </tr>
          `).join("") : ""}
        </tbody>
        <tfoot>
          <tr class="totals"><td colspan="3" class="right">Subtotal</td><td class="right">${fmt(r.subtotal)}</td></tr>
          ${r.vat ? `<tr class="totals"><td colspan="3" class="right">VAT</td><td class="right">${fmt(r.tax)}</td></tr>` : ""}
          <tr class="totals"><td colspan="3" class="right"><strong>Total</strong></td><td class="right"><strong>${fmt(r.total)}</strong></td></tr>
        </tfoot>
      </table>
    </div>

    <div class="footer">
      ${r.vat
        ? "If VAT-registered, this receipt reflects VAT amounts. For a tax invoice, include VAT registration no., supply date, and VAT breakdown by rate."
        : "Not VAT-registered. This receipt acknowledges payment received."
      }<br>
      Keep this document for your records. Generated by Business Manager Pro.
    </div>
  </div>
</body>
</html>`;
}
