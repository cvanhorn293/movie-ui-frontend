import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Webpack configuration for SVGs as React components
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
