import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: "client",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },

  server: {
    port: 8080,
    fs: {
      allow: ["."]
    }
  }
});