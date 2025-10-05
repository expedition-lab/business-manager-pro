// /api/receipts-insert.js
export const config = { runtime: "nodejs" };

// Small helper: parse JSON body even if body is a stream
async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const bufs = [];
  for await (const c of req) bufs.push(c);
  const t = Buffer.concat(bufs).toString("utf8");
  return t ? JSON.parse(t) : {};
}

export default async function handler(req, res) {
  try {
    // CORS preflight (optional; keep if you’ll ever call cross-origin)
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // ---- ENV: use the PUBLIC (anon) key for PostgREST & auth checks ----
    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
    if (!base || !anon) {
      return res.status(500).json({ error: "Supabase URL/ANON key missing in env" });
    }

    // ---- Require user's JWT (critical for RLS) ----
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Missing Authorization Bearer token" });

    // Optional: verify the token & get the user (good error messages)
    const me = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: anon, authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    if (!me || !me.id) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // ---- Parse and whitelist the request body ----
    const body = await readJsonBody(req);

    // Only allow fields that belong on the receipt row.
    // (Business data will be auto-copied by DB triggers.)
    const insertRow = {
      user_id: me.id, // REQUIRED for RLS + triggers
      reference_number: body.reference_number ?? null,
      date: body.date ?? new Date().toISOString(),

      // Identify client (either client_id or client_email)
      client_id: body.client_id ?? null,
      client_name: body.client_name ?? null,
      client_email: body.client_email ?? null,
      client_phone: body.client_phone ?? null,

      // Optional overrides (usually leave null; triggers fill these from `clients`)
      client_company_name: body.client_company_name ?? null,
      client_brn: body.client_brn ?? null,
      client_address: body.client_address ?? null,

      // Items + totals
      items: Array.isArray(body.items) ? body.items : [],
      subtotal: body.subtotal ?? null,
      tax: body.tax ?? null,
      total: body.total ?? null,

      // If you track status, you can accept it too (or set default on DB):
      status: body.status ?? null
    };

    // ---- Insert via PostgREST using the USER token (NOT the service key!) ----
    const r = await fetch(`${base}/rest/v1/receipts`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // apikey = anon public key; authorization = USER token
        apikey: anon,
        authorization: `Bearer ${token}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(insertRow)
    });

    const text = await r.text();
    // Forward original status & content-type
    res
      .status(r.status)
      .setHeader("content-type", r.headers.get("content-type") || "application/json")
      .send(text);

  } catch (e) {
    console.error("receipts-insert error:", e);
    res.status(500).json({ error: e.message || String(e) });
  }
}
