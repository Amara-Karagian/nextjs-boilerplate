import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pdf.js tries to require canvas on the server — alias it away
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
