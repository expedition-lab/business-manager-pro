export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { 
    status, 
    headers: { 'content-type': 'application/json' } 
  });

export default async function handler(req) {
  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    
    const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const key  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const site = (process.env.SITE_URL || '').trim();
    
    console.log('Env check:', { 
      hasBase: !!base, 
      hasKey: !!key, 
      hasSite: !!site 
    });
    
    if (!base) return json({ error: 'Missing SUPABASE_URL' }, 500);
    if (!key) return json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, 500);
    if (!site) return json({ error: 'Missing SITE_URL' }, 500);
    
    const body = await req.json();
    console.log('Request body:', { email: body.email, hasPassword: !!body.password });
    
    const { email, password, data } = body;
    if (!email || !password) return json({ error: 'Missing email or password' }, 400);
    
    const supabaseUrl = `${base}/auth/v1/signup`;
    console.log('Calling Supabase:', supabaseUrl);
    
    const r = await fetch(supabaseUrl, {
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
    
    console.log('Supabase response status:', r.status);
    const text = await r.text();
    console.log('Supabase response:', text);
    
    return new Response(text, { 
      status: r.status, 
      headers: { 'content-type': r.headers.get('content-type') || 'application/json' } 
    });
  } catch (e) {
    console.error('Signup error:', e);
    return json({ error: 'internal error', details: e.message, stack: e.stack }, 500);
  }
}
