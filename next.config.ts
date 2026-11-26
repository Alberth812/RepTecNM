//
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
//
const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://10.168.0.109:3000",
    "http://10.168.0.109.nip.io:3000",
    "10.168.0.109.nip.io:3000",
  ],
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
      // Añadido para que Next.js permita optimizar imágenes directamente desde el S3 vía nip.io si es necesario
      {
        protocol: "http",
        hostname: "10.168.0.109.nip.io",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "s3.10.168.0.109.nip.io",
        port: "3000",
        pathname: "/**",
      },
    ],
  },
  /* config options here */
};

export default withPayload(nextConfig);
