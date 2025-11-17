import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,

    minify: false,               // Do NOT minify code
    chunkSizeWarningLimit: 90,   // Warn for chunks > 90KB

    rollupOptions: {
      output: {
        // Split every dependency into its own chunk
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const parts = id.split("node_modules/")[1].split("/");
            
            // Handle scoped packages like @firebase/app
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
