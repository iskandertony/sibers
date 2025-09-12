import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy for users.json to avoid CORS issues during local dev.
      "/__users": {
        target: "https://hr2.sibers.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__users/, ""),
      }
    }
  }
});
