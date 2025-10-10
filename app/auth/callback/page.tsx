// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1) Exchange the code in the URL for a session (CRUCIAL)
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error('Auth callback error:', error);
        return window.location.replace('/');
      }

      // 2) Restore where the user intended to go (e.g., /app/checkout?plan=starter)
      const next = (() => {
        try {
          const saved = localStorage.getItem('next');
          return saved && saved.startsWith('/') ? saved : '/app';
        } catch {
          return '/app';
        }
      })();

      try { localStorage.removeItem('next'); } catch {}

      // 3) Send them there
      window.location.replace(next);
    })();
  }, []);

  return null;
}
