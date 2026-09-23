import { builtinModules } from "node:module";
import { defineConfig } from "vite";

// Bundles the CLI and the shared lib/ into one file, since Node won't strip
// TypeScript types in node_modules.
export default defineConfig({
    build: {
        ssr: "mobtimer.ts",
        outDir: "dist",
        emptyOutDir: true,
        target: "node24",
        minify: false,
        rollupOptions: {
            external: [
                ...builtinModules,
                ...builtinModules.map(m => `node:${m}`),
            ],
            output: {
                entryFileNames: "mobtimer.js",
            },
        },
    },
});
