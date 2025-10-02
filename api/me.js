export const config = { runtime: 'nodejs20.x', regions: ['iad1'] };

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const url = process.env.SUPABASE_URL.replace(/\/+$/, '') + '/auth/v1/user';
    const r = await fetch(url, {
      headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${token}` }
    });
    const text = await r.text();
    res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(text);
  } catch (e) {
    console.error('ME ERROR', e);
    res.status(500).json({ error: e.message || String(e) });
  }
}
