import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.103', '192.168.0.105', 'localhost', '*.loca.lt', '*.ngrok-free.app'],
  devIndicators: false,
};

export default nextConfig;
