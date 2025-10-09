// app/auth/callback/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const [msg, setMsg] = useState("Completing sign-in…");

  useEffect(() => {
    // Supabase handles the hash in the URL automatically
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/dashboard");
      } else {
        setMsg("Could not complete sign-in. Try again.");
      }
    });
  }, []);

  return (
    <main style={{ maxWidth: 600, margin: "64px auto", padding: 24 }}>
      <h1>{msg}</h1>
    </main>
  );
}
