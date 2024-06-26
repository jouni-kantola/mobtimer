import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    root: "resources",
    build: {
        outDir: "../dist",
        emptyOutDir: false,
    },
    server: {
        port: 3000,
    },
    plugins: [vue()],
});
