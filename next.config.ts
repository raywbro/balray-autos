import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force metadata (title, description, verification tags, etc.)
  // to render inside the <head> for all bots (including Google's
  // verification crawler). This is a workaround for a Next.js 16
  // issue where metadata is rendered inside <body> for dynamic pages.
  htmlLimitedBots: /.*/,
};

export default nextConfig;