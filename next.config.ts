import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  output: "standalone",

  // Enable built-in gzip compression
  compress: true,

  // Configure allowed image sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sparko-api-*.azurewebsites.net",
      },
    ],
  },
};

export default nextConfig;
