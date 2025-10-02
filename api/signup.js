// at the very top of EVERY api file
export const config = { runtime: 'edge', regions: ['iad1', 'fra1', 'dub1'] };

// api/signup.js
export const config = { runtime: 'edge' };
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});

export default async function handler(req){
  try{
    if(req.method!=='POST') return json({error:'Method not allowed'},405);

    const base=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
    const key =(process.env.SUPABASE_SERVICE_KEY||'').trim(); // sb_secret_...
    if(!base||!key) throw new Error('Missing env: SUPABASE_URL or SUPABASE_SERVICE_KEY');

    const { email, password, data } = await req.json();
    if(!email||!password) throw new Error('Missing email or password');

    const r = await fetch(base + '/auth/v1/admin/users', {
      method:'POST',
      headers:{
        'content-type':'application/json',
        apikey:key,
        Authorization:`Bearer ${key}`   // works with the new keys
      },
      body: JSON.stringify({ email, password, email_confirm:true, user_metadata:data||{} })
    });

    const t = await r.text();
    return new Response(t,{
      status:r.status,
      headers:{'content-type': r.headers.get('content-type') || 'application/json'}
    });
  }catch(e){
    return json({error: e.message || String(e)}, 500);
  }
}
