import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000, // change here
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/react-router")) {
            return "vendor-react";
          }

          if (id.includes("/@emotion/")) {
            return "vendor-emotion";
          }

          if (id.includes("/@mui/icons-material/")) {
            return "vendor-mui-icons";
          }

          if (id.includes("/@mui/x-date-pickers/")) {
            return "vendor-mui-date-pickers";
          }

          if (id.includes("/@mui/x-charts/")) {
            return "vendor-mui-charts";
          }

          if (id.includes("/@mui/material/") || id.includes("/@mui/system/") || id.includes("/@mui/utils/")) {
            return "vendor-mui";
          }

          if (id.includes("/@tanstack/react-query/")) {
            return "vendor-query";
          }

          if (id.includes("/dayjs/")) {
            return "vendor-dayjs";
          }

          return "vendor";
        },
      },
    },
  },
  plugins: [react()],
});
