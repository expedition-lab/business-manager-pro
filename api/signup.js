export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { 
    status, 
    headers: { 'content-type': 'application/json' } 
  });

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }
    
    // Check environment variables
    const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const key  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const site = (process.env.SITE_URL || '').trim();
    
    if (!base) return json({ error: 'SUPABASE_URL is missing or empty' }, 500);
    if (!key) return json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing or empty' }, 500);
    if (!site) return json({ error: 'SITE_URL is missing or empty' }, 500);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return json({ error: 'Invalid JSON in request body', details: parseError.message }, 400);
    }
    
    const { email, password, data } = body;
    
    if (!email || !password) {
      return json({ error: 'Missing email or password' }, 400);
    }
    
    // Call Supabase
    const supabaseUrl = `${base}/auth/v1/signup`;
    
    let supabaseResponse;
    try {
      supabaseResponse = await fetch(supabaseUrl, {
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
    } catch (fetchError) {
      return json({ 
        error: 'Failed to connect to Supabase', 
        details: fetchError.message,
        url: supabaseUrl 
      }, 500);
    }
    
    // Get response from Supabase
    const responseText = await supabaseResponse.text();
    
    return new Response(responseText, { 
      status: supabaseResponse.status, 
      headers: { 
        'content-type': supabaseResponse.headers.get('content-type') || 'application/json' 
      } 
    });
    
  } catch (e) {
    return json({ 
      error: 'Unexpected error', 
      message: e.message,
      name: e.name,
      stack: e.stack
    }, 500);
  }
}
