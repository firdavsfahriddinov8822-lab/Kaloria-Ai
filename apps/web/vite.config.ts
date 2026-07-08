import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { devApiPlugin } from "./vite-dev-api";

export default defineConfig({
  plugins: [
    react(),
    devApiPlugin(path.resolve(__dirname, "../../api")),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Kaloriya",
        short_name: "Kaloriya",
        description: "AI fitnes va ovqatlanish murabbiyi",
        theme_color: "#0B1020",
        background_color: "#0B1020",
        display: "standalone",
        lang: "uz",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
