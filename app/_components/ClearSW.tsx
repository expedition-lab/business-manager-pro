'use client';
import { useEffect } from 'react';

export default function ClearSW() {
  useEffect(() => {
    (async () => {
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) await r.unregister();
        } catch {}
      }
      if (window.caches) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        } catch {}
      }
    })();
  }, []);
  return null;
}
