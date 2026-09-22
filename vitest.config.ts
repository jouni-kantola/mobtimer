import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: "lib",
                    include: ["test/lib/**/*-test.[jt]s"],
                    environment: "node",
                },
            },
            {
                test: {
                    name: "gui",
                    include: ["test/**/*-test.[jt]s"],
                    exclude: ["test/lib/**"],
                    environment: "jsdom",
                },
                plugins: [vue()],
            },
        ],
    },
});
