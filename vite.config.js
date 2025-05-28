import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Expense Tracker",
        short_name: "ExpenseTracker",
        description: "Personal expense tracking application",
        theme_color: "#121212",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          // El plugin generará automáticamente más tamaños si activas `manifest.icons`.
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      injectManifest: {
        injectionPoint: undefined, // Opcional, para más control.
      },
    }),
  ],
  server: {
    port: 3100,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
