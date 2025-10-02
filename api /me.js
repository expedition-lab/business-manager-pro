export const config = { runtime: 'nodejs' };

export default async function handler(req,res){
  try{
    const base=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
    const key =(process.env.SUPABASE_SERVICE_KEY||'').trim();
    const auth=req.headers.authorization||'';
    const token=auth.startsWith('Bearer ')?auth.slice(7):'';
    if(!token) return res.status(401).json({error:'No token'});
    const r=await fetch(base + '/auth/v1/user',{ headers:{ apikey:key, authorization:`Bearer ${token}` }});
    const t=await r.text();
    res.status(r.status).setHeader('content-type', r.headers.get('content-type')||'application/json').send(t);
  }catch(e){ res.status(500).json({error:e.message||String(e)}); }
}
