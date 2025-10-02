export const config = { runtime: 'edge', regions: ['iad1','fra1','dub1'] };
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
export default async function handler(req){
  const base=(process.env.SUPABASE_URL||'').trim().replace(/\/+$/,'');
  const key =(process.env.SUPABASE_SERVICE_KEY||'').trim();
  const id=req.headers.get('x-vercel-id')||'';  // e.g. iad1::abc123

  const urlOk=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base);
  let probe='n/a';
  try{
    if(!urlOk) throw new Error('invalid-supabase-url');
    const r=await fetch(base+'/auth/v1/settings',{ headers:{ apikey:key }});
    probe=String(r.status);
  }catch(e){ probe='fetch-failed: ' + (e.message || String(e)); }

  return json({
    runtime:'edge', region_hint:id,
    supabase_url_echo:base, supabase_url_valid:urlOk,
    SERVICE_KEY_shape: key ? (key.startsWith('sb_')?'sb_secret_*':'other') : 'missing',
    supabase_probe_status: probe
  });
}
