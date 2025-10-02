export const config = { runtime: 'nodejs20.x', regions: ['iad1'] };

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const txt = Buffer.concat(chunks).toString('utf8');
  return txt ? JSON.parse(txt) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  try {
    const { email, password } = await readJsonBody(req);
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const url = process.env.SUPABASE_URL.replace(/\/+$/, '') + '/auth/v1/token?grant_type=password';
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ email, password })
    });

    const text = await r.text();
    res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(text);
  } catch (e) {
    console.error('LOGIN ERROR', e);
    res.status(500).json({ error: e.message || String(e) });
  }
}
