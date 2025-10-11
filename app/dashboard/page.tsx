"use client";
import { useEffect } from "react";
import { ensureUserProfile } from "@/lib/ensureUserProfile";

export default function DashboardPage() {
  useEffect(() => {
    (async () => {
      try {
        await ensureUserProfile({}); // minimal payload; fills blanks safely
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return <div>Dashboard…</div>;
}
