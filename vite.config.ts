import type { Plugin, ResolvedConfig } from "vite";

import { defineConfig } from "vite";
import fs from "node:fs/promises";
import path from "node:path";

import vue from "@vitejs/plugin-vue";

const neutralino = (): Plugin => {
    let config: ResolvedConfig;

    return {
        name: "neutralino",
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        async transformIndexHtml(html) {
            if (config.mode === "development") {
                const authInfoFile = await fs.readFile(
                    path.join(".tmp", "auth_info.json"),
                    {
                        encoding: "utf-8",
                    }
                );

                const authInfo = JSON.parse(authInfoFile);
                const port = authInfo.nlPort;

                return html.replace(
                    /<script src="__neutralino_globals\.js"><\/script>/,
                    `<script src="http://localhost:${port}/__neutralino_globals.js"></script>`
                );
            }

            return html;
        },
    };
};

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
    plugins: [vue(), neutralino()],
});
