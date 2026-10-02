import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force metadata to be rendered in the <head> for these bots.
  // This is a workaround for a known issue in Next.js 16.
  htmlLimitedBots: /.*/,
};

export default nextConfig;