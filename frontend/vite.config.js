import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL || "https://jobmatchgambia.vercel.app";

  return {
    plugins: [
      react(),
      {
        name: "html-social-meta",
        transformIndexHtml(html) {
          return html.replaceAll("%VITE_SITE_URL%", siteUrl);
        },
      },
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
