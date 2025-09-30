import { supabaseAdmin } from "./_supabase.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const email = String(req.query.email || "").trim().toLowerCase();
      if (!email) return res.status(400).json({ error: "email required" });

      const { data, error } = await supabaseAdmin
        .from("subscriptions")
        .select("active")
        .eq("user_email", email)
        .maybeSingle();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ active: !!(data && data.active) });
    }

    if (req.method === "POST") {
      const { email } = req.body || {};
      if (!email) return res.status(400).json({ error: "email required" });

      // upsert active=true
      const { error } = await supabaseAdmin
        .from("subscriptions")
        .upsert({ user_email: email, active: true }, { onConflict: "user_email" });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
