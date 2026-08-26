import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://172.16.30.7:3000",
    "http://localhost:3000",
    /*"http://s3.localhost:3000",*/
  ],
  devIndicators: false,
  /* config options here */
};

export default withPayload(nextConfig);
