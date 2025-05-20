import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,

  typescript: {
    // Set to true to allow production builds even if there are type errors.
    // Be cautious with this setting.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
