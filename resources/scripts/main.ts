import { createApp } from "vue";
import App from "./App.vue";
import { loadSettings } from "../../lib/settings.ts";
import {
    init,
    loadTheme,
    registerEvents,
    settingsStore,
} from "./neutralino-api";
import { applyTheme } from "./theme.ts";
import { createTeam } from "../../lib/team.ts";

async function initApp() {
    init();
    registerEvents();

    const theme = await loadTheme();
    applyTheme(theme);

    const { members, intervalSeconds } = await loadSettings(settingsStore);

    createApp(App, {
        team: [...createTeam(members)],
        intervalLengthInSeconds: intervalSeconds,
        theme,
    }).mount("#app");
}

initApp();
