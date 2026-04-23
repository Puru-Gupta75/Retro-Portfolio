import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure correct working directory for PostCSS
  experimental: {
    // Force Next.js to use the correct base path for CSS imports
  },
};

export default nextConfig;
