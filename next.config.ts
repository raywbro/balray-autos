import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force metadata (title, description, verification tags, etc.)
  // to render inside the <head> for all bots.
  htmlLimitedBots: /.*/,

  // Image optimization
  images: {
    // Allow images from Supabase Storage and Unsplash
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
    // Modern formats — browsers get AVIF or WebP automatically
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,
    // Standard device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Automatically tree-shake these heavy packages
  experimental: {
    optimizePackageImports: [
      "@supabase/ssr",
      "@supabase/supabase-js",
      "@next/third-parties",
      "browser-image-compression",
    ],
  },

  // Reduce build size
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;