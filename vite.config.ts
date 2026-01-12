import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
// Essential for Solana Web3
import { nodePolyfills } from "vite-plugin-node-polyfills"; 

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // 1. Polyfills must be first to prevent white-screen crashes
    nodePolyfills({
      globals: {
        Buffer: true, // Critical for Solana
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Stream.fun - Real-Time Creator Payments",
        short_name: "Stream.fun",
        description: "Support your favorite creators with real-time micro-payments on Solana",
        theme_color: "#00FF88",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 2. Prevent the build from stripping necessary modules in production
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
}));
