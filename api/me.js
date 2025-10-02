import { requireEnv } from './_util';

export default async function handler(req, res) {
  if (!requireEnv(res, ['SUPABASE_URL','SUPABASE_SERVICE_KEY'])) return;
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const r = await fetch(`${process.env.SUPABASE_URL.replace(/\/+$/,'')}/auth/v1/user`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    const text = await r.text();
    res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(text);
  } catch (e) {
    console.error('ME ERROR', e);
    res.status(500).json({ error: e.message || String(e) });
  }
}
