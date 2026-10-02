import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dossiers séparés : `npm run dev` et `npm run start` peuvent tourner en même temps sans s'écraser
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
