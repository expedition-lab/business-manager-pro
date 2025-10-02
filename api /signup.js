export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { 
    status, 
    headers: { 'content-type': 'application/json' } 
  });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const site = (process.env.SITE_URL || '').trim();
  
  if (!base || !key || !site) return json({ error: 'Missing env vars' }, 500);
  
  try {
    const { email, password, data } = await req.json();
    if (!email || !password) return json({ error: 'Missing email or password' }, 400);
    
    const r = await fetch(base + '/auth/v1/signup', {
      method: 'POST',
      headers: { 
        'content-type': 'application/json', 
        apikey: key, 
        Authorization: `Bearer ${key}` 
      },
      body: JSON.stringify({ 
        email, 
        password, 
        data: data || {}, 
        email_redirect_to: `${site}/app/#signup-confirmed` 
      })
    });
    
    const text = await r.text();
    return new Response(text, { 
      status: r.status, 
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' } 
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
