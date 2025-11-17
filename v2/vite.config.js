import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 90,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Split each package → its own chunk
            const parts = id
              .split("node_modules/")[1]
              .split("/");

            // Scoped packages (e.g., @firebase/app)
            if (parts[0].startsWith("@")) {
              return `${parts[0]}/${parts[1]}`;
            }

            return parts[0];
          }
        },
      },
    },
  },

  plugins: [react()],
});
