// app/api/receipts/[id]/pdf/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import PDFDocument from "pdfkit";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies, headers }
  );

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: r, error } = await sb
    .from("receipts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !r) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ref = r.reference_number || r.ref || r.id.slice(0, 8);

  // Build PDF in memory
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  // Header
  doc.fontSize(18).text("Business Manager Pro — Tax Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Reference: ${ref}`);
  doc.text(`Date: ${new Date(r.date ?? r.created_at).toLocaleString()}`);
  doc.text(`Client: ${r.client_name ?? "—"}${r.client_email ? ` • ${r.client_email}` : ""}`);
  doc.moveDown();

  // Items
  const items = Array.isArray(r.items) ? r.items : [];
  if (items.length) {
    doc.fontSize(12).text("Items:");
    items.forEach((it: any) => {
      const d = it?.description ?? "Item";
      const q = Number(it?.qty ?? 1);
      const u = Number(it?.unit_price ?? 0);
      doc.text(`• ${d} — Qty ${q} @ ${u.toFixed(2)}`);
    });
    doc.moveDown();
  }

  // Totals
  doc.fontSize(14).text(`Subtotal: ${(r.currency ?? "MUR")} ${Number(r.subtotal ?? 0).toFixed(2)}`, { align: "right" });
  doc.text(`Tax: ${(r.currency ?? "MUR")} ${Number(r.tax ?? 0).toFixed(2)}`, { align: "right" });
  doc.text(`Total: ${(r.currency ?? "MUR")} ${Number(r.total ?? 0).toFixed(2)}`, { align: "right" });
  doc.end();

  const pdf = await done;
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receipt_${ref}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
