// app/auth/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // read initial mode from ?mode=signup (or default to signin)
  const [mode, setMode] = useState<'signin' | 'signup'>(
    (sp.get('mode') === 'signup' ? 'signup' : 'signin')
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 1) Capture ?next=... and stash it
  useEffect(() => {
    const next = sp.get('next');
    if (next) {
      try { localStorage.setItem('next', next); } catch {}
    }
  }, [sp]);

  // helper: where to go after auth
  function getNext(): string {
    try {
      const saved = localStorage.getItem('next');
      return saved && saved.startsWith('/') ? saved : '/app';
    } catch {
      return '/app';
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    if (mode === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setErr(error.message);
      if (data.user) {
        const next = getNext();
        try { localStorage.removeItem('next'); } catch {}
        // use router to avoid full reload
        return router.replace(next);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setErr(error.message);
      setMsg('Check your email to confirm your account, then sign in.');
    }
  }

  async function sendMagicLink() {
    setErr(null);
    setMsg(null);
    setLoading(true);
    const redirect = `${window.location.origin}/auth/callback`; // callback finishes session & returns to next
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirect },
    });
    setLoading(false);
    if (error) setErr(error.message);
    else setMsg('Magic link sent. Check your inbox.');
  }

  return (
    <main style={{ maxWidth: 420, margin: '64px auto', padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Use email + password, or request a magic link.
      </p>

      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="email@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', margin: '10px 0', padding: 10 }}
        />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={mode === 'signin' || mode === 'signup'}
          style={{ width: '100%', margin: '10px 0', padding: 10 }}
        />
        <button
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', padding: 12, marginTop: 8 }}
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={sendMagicLink} className="btn-outline" disabled={loading}>
          Send magic link
        </button>
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="btn-ghost"
          disabled={loading}
        >
          {mode === 'signin' ? 'Create an account' : 'Have an account? Sign in'}
        </button>
      </div>

      {msg && <p style={{ color: '#0ea5e9', marginTop: 12 }}>{msg}</p>}
      {err && <p style={{ color: 'crimson', marginTop: 12 }}>{err}</p>}
    </main>
  );
}
