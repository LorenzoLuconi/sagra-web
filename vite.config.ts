import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000, // change here
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-react",
              test: /node_modules[\\/](react|react-dom|react-router)([\\/]|$)/,
              priority: 90,
            },
            {
              name: "vendor-emotion",
              test: /node_modules[\\/]@emotion[\\/]/,
              priority: 80,
            },
            {
              name: "vendor-mui-icons",
              test: /node_modules[\\/]@mui[\\/]icons-material[\\/]/,
              priority: 70,
            },
            {
              name: "vendor-mui-date-pickers",
              test: /node_modules[\\/]@mui[\\/]x-date-pickers[\\/]/,
              priority: 70,
            },
            {
              name: "vendor-mui-charts",
              test: /node_modules[\\/]@mui[\\/]x-charts[\\/]/,
              priority: 70,
            },
            {
              name: "vendor-mui",
              test: /node_modules[\\/]@mui[\\/](material|system|utils)[\\/]/,
              priority: 60,
            },
            {
              name: "vendor-query",
              test: /node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
              priority: 50,
            },
            {
              name: "vendor-dayjs",
              test: /node_modules[\\/]dayjs[\\/]/,
              priority: 50,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  plugins: [react()],
});
