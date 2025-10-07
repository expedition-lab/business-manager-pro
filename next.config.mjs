/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking protection
          { key: "X-Frame-Options", value: "DENY" },
          // Basic XSS protection (legacy)
          { key: "X-XSS-Protection", value: "0" },
          // Referrer privacy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS (enable only after all subdomains are https)
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Permissions Policy (lock down powerful APIs)
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https:;",
              "font-src 'self' data: https:;",
              "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io;",
              "frame-ancestors 'none';",
              "base-uri 'self';",
              "form-action 'self';",
            ].join(" ")
          }
        ],
      },
    ];
  },
};
export default nextConfig;
