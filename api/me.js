export default async function handler(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  const body = await r.text();
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(body);
}
