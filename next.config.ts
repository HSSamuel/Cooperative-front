import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // 🚀 FIX: Removed swcMinify from the PWA plugin options
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
  // 🚀 FIX: Moved swcMinify to the top-level Next.js config (though it is true by default in Next.js 14+)
  swcMinify: true,
};

export default withPWA(nextConfig);
