import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/rinha-json/",
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js'
  },
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: "[name].js", // currently does not work for the legacy bundle
        assetFileNames: "[name].[ext]", // currently does not work for images
      },
    },
  },
});
