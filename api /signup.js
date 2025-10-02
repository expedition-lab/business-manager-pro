export const config = { runtime: 'nodejs' };

async function readJsonBody(req){
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks=[]; for await (const c of req) chunks.push(c);
  const txt=Buffer.concat(chunks).toString('utf8'); return txt?JSON.parse(txt):{};
}

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});

    const base=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
    const key =(process.env.SUPABASE_SERVICE_KEY||'').trim();   // sb_secret_...
    const jwt =(process.env.SUPABASE_SERVICE_JWT||'').trim();   // optional eyJ...
    if(!base||!key) return res.status(500).json({error:'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY'});

    const { email, password, data } = await readJsonBody(req);
    if(!email||!password) return res.status(400).json({error:'Missing email or password'});

    const authHeader = `Bearer ${jwt || key}`; // prefer JWT if provided
    const r = await fetch(base + '/auth/v1/admin/users', {
      method:'POST',
      headers:{ 'content-type':'application/json', apikey:key, authorization:authHeader },
      body: JSON.stringify({ email, password, email_confirm:true, user_metadata: data||{} })
    });

    const text = await r.text();
    res.status(r.status).setHeader('content-type', r.headers.get('content-type')||'application/json').send(text);
  }catch(e){ res.status(500).json({error:e.message||String(e)}); }
}
