export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password, data } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    },
    body: JSON.stringify({
      email,
      password,
      data: data || {},
      email_redirect_to: `${process.env.SITE_URL || 'https://business-manager-pro.vercel.app'}/app/#signup-confirmed`
    })
  });

  const body = await r.text();
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(body);
}
