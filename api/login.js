import { readJsonBody, requireEnv, passThrough } from './_util';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireEnv(res, ['SUPABASE_URL','SUPABASE_SERVICE_KEY'])) return;

  try {
    const { email, password } = await readJsonBody(req);
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const u = `${process.env.SUPABASE_URL.replace(/\/+$/,'')}/auth/v1/token?grant_type=password`;
    const { ok, status, text, type } = await passThrough(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ email, password })
    });

    if (!ok) {
      console.error('LOGIN FAIL', status, text);
      return res.status(status).setHeader('Content-Type', type).send(text);
    }
    res.status(status).setHeader('Content-Type', type).send(text);
  } catch (e) {
    console.error('LOGIN ERROR', e);
    res.status(500).json({ error: e.message || String(e) });
  }
}
