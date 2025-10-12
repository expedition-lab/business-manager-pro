// app/_components/ClearSW.tsx
"use client";
import { useEffect } from "react";

export default function ClearSW() {
  useEffect(() => {
    const run = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister().catch(() => {})));
        }
        if ("caches" in window) {
          const names = await caches.keys();
          await Promise.all(names.map(n => caches.delete(n).catch(() => {})));
        }
        // one-time hard refresh to load fresh assets
        const FLAG = "__bmp_sw_cleared__";
        if (!sessionStorage.getItem(FLAG)) {
          sessionStorage.setItem(FLAG, "1");
          location.replace(location.href);
        }
      } catch { /* ignore */ }
    };
    run();
  }, []);
  return null;
}
