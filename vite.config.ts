import { defineConfig } from "vite";
import path from "path";
import { createServer } from "./server/index";

export default defineConfig({
  root: "client",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },

  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },

  plugins: [
    {
      name: "express-plugin",
      configureServer(server) {
        const app = createServer();
        server.middlewares.use(app);
      },
    },
  ],

  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" ||
          (warning.message && warning.message.includes('"use client"'))
        ) {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
});