export const config = { runtime: 'edge' };

const json = (o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});

export default async function handler(req){
  if(req.method !== 'POST') return json({error:'Method not allowed'},405);

  const base=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
  const apikey=(process.env.SUPABASE_SERVICE_KEY||'').trim(); // sb_secret_...
  const jwt=(process.env.SUPABASE_SERVICE_JWT||'').trim();    // eyJ...
  if(!base||!apikey||!jwt) return json({error:'Missing env vars (URL,SERVICE_KEY,SERVICE_JWT)'},500);

  const { email, password, data } = await req.json();
  if(!email||!password) return json({error:'Missing email or password'},400);

  const r = await fetch(base + '/auth/v1/admin/users', {
    method: 'POST',
    headers: { 'content-type':'application/json', apikey, Authorization:`Bearer ${jwt}` },
    body: JSON.stringify({ email, password, email_confirm:true, user_metadata: data||{} })
  });

  const text = await r.text();
  return new Response(text, { status:r.status, headers:{'content-type': r.headers.get('content-type') || 'application/json'} });
}
