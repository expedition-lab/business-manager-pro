// at the very top of EVERY api file
export const config = { runtime: 'edge', regions: ['iad1', 'fra1', 'dub1'] };

export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key  = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!base || !key) return json({ error: 'Missing env vars' }, 500);

  try {
    const { email, password } = await req.json();
    if (!email || !password) return json({ error: 'Missing email or password' }, 400);

    const r = await fetch(base + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ email, password })
    });

    const text = await r.text();
    return new Response(text, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
  } catch (e) {
    return json({ error: e.message || String(e) }, 500);
  }
}
