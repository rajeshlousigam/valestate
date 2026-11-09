/** @type {import('next').NextConfig} */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://control.estaraimphal.com/api/web/v1").replace(/\/$/, "");

const nextConfig = {
  reactStrictMode: true,
  // The Estara API returns 404 to CORS preflight (OPTIONS), so browsers block
  // JSON POSTs and Authorization-bearing calls. Proxy browser calls same-origin.
  async rewrites() {
    return [{ source: "/estara-api/:path*", destination: `${API_ORIGIN}/:path*` }];
  },
  poweredByHeader: false,
  // SEO-first: default to server rendering; ISR configured per-route (docs/11).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
