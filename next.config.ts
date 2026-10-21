import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.avval.app",
      },
      {
        protocol: "https",
        hostname: "api.avval.app",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // The shop's addresses are the old storefront template's (see lib/seo.tsx). These move
  // this design's earlier addresses, and old-template pages it has no page for, there for good.
  async redirects() {
    return [
      { source: "/product/:slug", destination: "/products/:slug", permanent: true },
      { source: "/account", destination: "/profile", permanent: true },
      { source: "/profile/orders", destination: "/profile", permanent: true },
      { source: "/login", destination: "/profile", permanent: true },
      { source: "/cart", destination: "/checkout", permanent: true },
    ];
  },
};

export default nextConfig;
