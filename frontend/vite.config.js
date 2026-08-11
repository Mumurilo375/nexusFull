import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const frontendRoot = process.cwd();
  const workspaceRoot = path.resolve(frontendRoot, "..");
  const env = {
    ...loadEnv(mode, workspaceRoot, ""),
    ...loadEnv(mode, frontendRoot, ""),
  };
  const proxyTarget =
    env.VITE_API_PROXY_TARGET ||
    (env.BACKEND_PORT_HOST
      ? `http://localhost:${env.BACKEND_PORT_HOST}`
      : "http://localhost:3000");

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: "jsdom",
    },
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/media": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
