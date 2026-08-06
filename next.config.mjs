/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled because react-leaflet's MapContainer throws "Map container
  // is already initialized" under Strict Mode's dev-only double-mount.
  // Safe to re-enable once react-leaflet ships official Strict Mode
  // support; nothing else in this project relies on double-invoke checks.
  reactStrictMode: false,
  // Hides the floating "N" dev indicator badge shown during `npm run
  // dev`. Purely cosmetic — it never appears in a production build/
  // deploy, this just also hides it locally.
  devIndicators: false,
  // Hides the `X-Powered-By: Next.js` response header (minor security
  // hardening — no functional benefit, just don't advertise the stack).
  poweredByHeader: false,
  // Gzip/brotli compression for server-rendered responses.
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh7-us.googleusercontent.com" },
    ],
  },
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
