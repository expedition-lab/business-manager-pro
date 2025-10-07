import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// reuse your existing renderHTML etc. by importing from the other file if you prefer
function fmt(n: unknown) {
  const num = typeof n === "number" ? n : Number(n ?? 0);
  return `Rs ${num.toFixed(2)}`;
}
function esc(s?: string) {
  return (s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

function renderHTML(r: any) {
  const issuer = {
    name: r.business_name || "",
    brn: r.brn || "",
    vat: r.vat_number || r.vat || "",
    address: esc(r.business_address || "").replace(/\n/g,"<br>"),
    email: esc(r.business_email || ""),
    phone: esc(r.business_phone || ""),
    logo: r.logo_url || "",
  };
  const items = Array.isArray(r.items) ? r.items : (() => { try { const v = JSON.parse(r.items ?? "[]"); return Array.isArray(v)?v:[]; } catch { return []; }})();
  const issued = r.date ? new Date(r.date) : new Date();

  return `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${esc(r.reference_number||r.id)}</title>
  <style>
  :root{--fg:#0f172a;--muted:#64748b;--line:#e2e8f0}
  *{box-sizing:border-box}body{margin:0;font:14px/1.5 ui-sans-serif,system-ui;color:var(--fg)}
  .wrap{max-width:800px;margin:32px auto;padding:0 24px}
  .row{display:flex;gap:16px}.col{flex:1}
  .header{align-items:flex-start;justify-content:space-between}
  .card{border:1px solid var(--line);border-radius:12px;padding:16px;background:#fff}
  .muted{color:var(--muted)}.title{font-weight:600}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{padding:10px 8px;border-bottom:1px solid var(--line);text-align:left}
  .right{text-align:right}.totals td{border-bottom:none}
  img.logo{height:56px;object-fit:contain}
  </style></head><body><div class="wrap">

  <div class="row header">
    <div class="col">
      ${issuer.logo ? `<img class="logo" src="${issuer.logo}" alt="logo">` : ""}
      <h1 style="margin:6px 0 0">RECEIPT</h1>
      <div class="muted">Receipt #: <span class="title">${esc(r.reference_number || r.id)}</span></div>
      <div class="muted">Date: <span class="title">${issued.toLocaleDateString()}</span></div>
    </div>
    <div class="col" style="text-align:right">
      <div class="title" style="font-size:16px">${esc(issuer.name)}</div>
      <div>${issuer.address}</div>
      <div>${issuer.email}${issuer.phone ? " · " + issuer.phone : ""}</div>
      <div>${issuer.brn ? "BRN: " + esc(issuer.brn) : ""}${issuer.vat ? (issuer.brn ? " · " : "") + "VAT: " + esc(issuer.vat) : ""}</div>
    </div>
  </div>

  <div class="row" style="margin-top:16px">
    <div class="col card">
      <div class="title" style="margin-bottom:8px">Bill to</div>
      <div>${esc(r.client_name || "-")}</div>
      <div class="muted">${esc(r.client_email || "")}${r.client_phone ? " · " + esc(r.client_phone) : ""}</div>
    </div>
    <div class="col card">
      <div class="title" style="margin-bottom:8px">Payment</div>
      <div class="muted">Currency</div><div>Rs (MUR)</div>
      <div class="muted">Status</div><div>${esc(r.payment_status || "PAID")}</div>
    </div>
  </div>

  <div class="card" style="margin-top:16px">
    <table>
      <thead><tr><th>Description</th><th class="right">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr></thead>
      <tbody>
        ${items.map((it:any)=>`
          <tr>
            <td>${esc(it.description||"")}</td>
            <td class="right">${it.qty ?? 1}</td>
            <td class="right">Rs ${(Number(it.unit_price||0)).toFixed(2)}</td>
            <td class="right">Rs ${((Number(it.qty||1))*Number(it.unit_price||0)).toFixed(2)}</td>
          </tr>`).join("")}
      </tbody>
      <tfoot>
        <tr class="totals"><td colspan="3" class="right">Subtotal</td><td class="right">Rs ${(Number(r.subtotal||0)).toFixed(2)}</td></tr>
        ${Number(r.tax||0) ? `<tr class="totals"><td colspan="3" class="right">Tax</td><td class="right">Rs ${(Number(r.tax||0)).toFixed(2)}</td></tr>` : ""}
        <tr class="totals"><td colspan="3" class="right"><strong>Total</strong></td><td class="right"><strong>Rs ${(Number(r.total||0)).toFixed(2)}</strong></td></tr>
      </tfoot>
    </table>
  </div>

  <p class="muted" style="margin-top:12px">
    This receipt acknowledges payment. If VAT-registered, amounts include VAT as indicated.
  </p>

  </div></body></html>`;
}

export async function GET(_req: NextRequest, { params }: { params: { ref: string } }) {
  const sb = createClient();

  const { data: r, error } = await sb
    .from("receipts")
    .select("*")
    .eq("reference_number", params.ref)
    .single();

  if (error || !r) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  const html = renderHTML(r);
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
