export async function readJsonBody(req) {
  try {
    if (req.body && typeof req.body === 'object') return req.body; // Next.js parsed
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const txt = Buffer.concat(chunks).toString('utf8');
    return txt ? JSON.parse(txt) : {};
  } catch (e) {
    return {};
  }
}

export function requireEnv(res, keys) {
  for (const k of keys) {
    if (!process.env[k]) {
      res.status(500).json({ error: `Missing env var ${k}` });
      return false;
    }
  }
  return true;
}

export async function passThrough(url, init) {
  const r = await fetch(url, init);
  const text = await r.text();
  const type = r.headers.get('content-type') || 'application/json';
  return { ok: r.ok, status: r.status, text, type };
}
