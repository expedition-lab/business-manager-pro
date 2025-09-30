import { supabaseAdmin } from "./_supabase.js";

/**
 * POST /api/receipts  -> create one receipt
 * GET  /api/receipts?user=<email> -> list receipts for user (optional)
 */
export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { userEmail, receipt } = req.body || {};
      if (!userEmail || !receipt) return res.status(400).json({ error: "userEmail and receipt required" });

      // upsert basic user row (optional, harmless if exists)
      await supabaseAdmin.from("users").upsert({ email: userEmail }, { onConflict: "email" });

      // store receipt
      const row = {
        user_email: userEmail,
        ref: receipt.ref,
        date: receipt.date,
        customer: receipt.customer,
        items: receipt.items,               // JSONB
        subtotal: receipt.subtotal,
        vat_pct: receipt.vatPct,
        vat_amt: receipt.vatAmt,
        discount: receipt.discount,
        fee: receipt.fee,
        grand: receipt.grand
      };

      const { data, error } = await supabaseAdmin.from("receipts").insert(row).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    if (req.method === "GET") {
      const userEmail = req.query.user || "";
      if (!userEmail) return res.status(400).json({ error: "user query param required" });
      const { data, error } = await supabaseAdmin
        .from("receipts")
        .select("*")
        .eq("user_email", userEmail)
        .order("date", { ascending: false })
        .limit(200);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, data });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
