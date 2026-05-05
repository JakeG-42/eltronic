import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
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
  outputFileTracingIncludes: {
    "/studio/templates": [
      "./src/app/**/*.tsx",
      "./src/app/**/*.ts",
      "./src/components/**/*.tsx",
      "./src/content/**/*.ts",
      "./src/lib/**/*.ts",
      "./src/app/globals.css",
    ],
  },
};

export default withPayload(nextConfig);
