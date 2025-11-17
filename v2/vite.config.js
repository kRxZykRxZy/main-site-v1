import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// MAX chunk size in KB
const MAX_CHUNK_SIZE = 90;

function enforceChunkSizePlugin() {
  return {
    name: "enforce-chunk-size",
    generateBundle(options, bundle) {
      for (const [fileName, file] of Object.entries(bundle)) {
        if (file.type === "chunk" && file.code.length > MAX_CHUNK_SIZE * 1024) {
          console.warn(
            `⚠️  Chunk ${fileName} is too big (${Math.round(
              file.code.length / 1024
            )}kb). Splitting...`
          );

          // Force-split by reassigning manual chunks
          const parts = file.modules
            ? Object.keys(file.modules)
            : [`${fileName}-part`];

          // Create a new chunk for each module in the oversized chunk
          parts.forEach((moduleId, index) => {
            this.emitFile({
              type: "chunk",
              id: moduleId,
              name: `${fileName}-split-${index}`,
            });
          });

          // Delete the original large file
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: MAX_CHUNK_SIZE,

    rollupOptions: {
      output: {
        // base splitting (important)
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const pkg = id.split("node_modules/")[1].split("/")[0];
            return pkg;
          }
        },
      },
    },
  },

  plugins: [react(), enforceChunkSizePlugin()],
});
