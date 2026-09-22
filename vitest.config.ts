import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: "node",
                    include: [
                        "test/lib/**/*-test.[jt]s",
                        "test/cli/**/*-test.[jt]s",
                    ],
                    environment: "node",
                },
            },
            {
                test: {
                    name: "gui",
                    include: ["test/**/*-test.[jt]s"],
                    exclude: ["test/lib/**", "test/cli/**"],
                    environment: "jsdom",
                },
                plugins: [vue()],
            },
        ],
    },
});
