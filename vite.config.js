import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  root: "resources",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    port: 3000
  },
})
