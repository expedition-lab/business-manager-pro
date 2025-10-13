// app/receipts/[id]/page.tsx
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies, headers }
  );

  // Require auth
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return notFound();

  // Fetch the user’s receipt
  const { data: r, error } = await sb
    .from("receipts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !r) return notFound();

  const ref = r.reference_number || r.ref || r.id.slice(0, 8);

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Receipt {ref}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`/api/receipts/${r.id}/pdf`} style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            Download PDF
          </a>
          {ref && (
            <a
              href={`/verify/${encodeURIComponent(ref)}`}
              target="_blank"
              style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
            >
              Public Verify
            </a>
          )}
        </div>
      </div>

      <section style={{ marginTop: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", padding: 16 }}>
        <div><b>Date:</b> {new Date(r.date ?? r.created_at).toLocaleString()}</div>
        <div><b>Client:</b> {r.client_name ?? "—"} {r.client_email ? `• ${r.client_email}` : ""}</div>
        <div><b>Status:</b> {r.payment_status ?? "unpaid"}</div>
        <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>
          Amount: {(r.currency ?? "MUR")} {Number(r.total ?? 0).toFixed(2)}
        </div>

        <div style={{ marginTop: 16 }}>
          <b>Items</b>
          <div style={{ marginTop: 6, background: "#f8fafc", borderRadius: 8, padding: 12, overflow: "auto" }}>
            <pre style={{ margin: 0, fontSize: 13 }}>{JSON.stringify(r.items ?? [], null, 2)}</pre>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 4 }}>
          <div><b>Business:</b> {r.business_name ?? "—"}</div>
          <div><b>BRN:</b> {r.brn ?? "—"} • <b>VAT:</b> {r.vat_number ?? "—"}</div>
          <div><b>Contact:</b> {r.business_email ?? "—"} {r.business_phone ? `• ${r.business_phone}` : ""}</div>
          <div><b>Address:</b> {r.business_address ?? "—"}</div>
        </div>
      </section>
    </main>
  );
}
