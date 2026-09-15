import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const frontendRoot = process.cwd();
  const workspaceRoot = path.resolve(frontendRoot, "..");
  const previousUserNodeEnv = process.env.VITE_USER_NODE_ENV;
  const envPrefixes = ["VITE_", "BACKEND_PORT_HOST"];
  const env = {
    ...loadEnv(mode, workspaceRoot, envPrefixes),
    ...loadEnv(mode, frontendRoot, envPrefixes),
  };
  if (previousUserNodeEnv === undefined) {
    delete process.env.VITE_USER_NODE_ENV;
  } else {
    process.env.VITE_USER_NODE_ENV = previousUserNodeEnv;
  }
  const proxyTarget =
    env.VITE_API_PROXY_TARGET ||
    (env.BACKEND_PORT_HOST
      ? `http://localhost:${env.BACKEND_PORT_HOST}`
      : "http://localhost:3000");

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            axios: ["axios"],
            icons: ["lucide-react"],
          },
        },
      },
    },
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
