/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Allowlist the services you actually use
    const CONNECT_SRC = [
      "'self'",
      "https://*.supabase.co",
      "https://*.ingest.sentry.io",
    ];

    const IMG_SRC = [
      "'self'",
      "data:",
      "blob:",
      "https:",        // e.g. Supabase Storage public objects
    ];

    const FONT_SRC = [
      "'self'",
      "data:",
      "https:",
    ];

    // If you use Google Fonts, uncomment the next two:
    // FONT_SRC.push("https://fonts.googleapis.com", "https://fonts.gstatic.com");

    // If you use Vercel’s Preview Inspector, add vercel.live to script-src:
    const SCRIPT_SRC = [
      "'self'",
      "'unsafe-inline'",
      // "vercel.live", // <- uncomment only if you use Vercel preview inspector
    ];

    const STYLE_SRC = [
      "'self'",
      "'unsafe-inline'", // Next.js often needs this for inlined CSS
    ];

    const csp = [
      `default-src 'self'`,
      `script-src ${SCRIPT_SRC.join(" ")}`,
      `style-src ${STYLE_SRC.join(" ")}`,
      `img-src ${IMG_SRC.join(" ")}`,
      `font-src ${FONT_SRC.join(" ")}`,
      `connect-src ${CONNECT_SRC.join(" ")}`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `upgrade-insecure-requests`,
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy
          { key: "Content-Security-Policy", value: csp },

          // Transport & clickjacking
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },

          // Sniffing & referrers
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Lock down powerful APIs
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
