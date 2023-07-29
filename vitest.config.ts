import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    test: {
        include: ["test/**/*-test.[jt]s"],
        environment: "jsdom",
    },
    plugins: [vue()],
});
