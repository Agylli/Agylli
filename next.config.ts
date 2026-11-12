import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  allowedDevOrigins: ["127.0.0.1"],
  images: { remotePatterns: [
    { protocol: "https", hostname: "**.mitiendanube.com" },
    { protocol: "https", hostname: "d26lpennugtm8s.cloudfront.net" },
  ] },
  outputFileTracingExcludes: {
    "/*": ["./tools/conciliacao/**/*", "./dados-comerciais/**/*"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};
export default nextConfig;
