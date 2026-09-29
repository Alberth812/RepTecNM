import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

//
//
const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://172.16.30.7:3000", "http://localhost:3000"],
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    localPatterns: [
      {
        pathname: "/contenido-api/media/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/contenido-api/media/**",
      },
    ],
  },
  /* config options here */
};

export default withPayload(nextConfig);
