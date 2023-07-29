import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    test: {
        include: ["test/**/*-test.[jt]s"],
        environment: "happy-dom",
    },
    plugins: [vue()],
});
