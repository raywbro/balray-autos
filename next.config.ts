import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    optimizePackageImports: [
      "@supabase/ssr",
      "@supabase/supabase-js",
      "@next/third-parties",
      "browser-image-compression",
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;