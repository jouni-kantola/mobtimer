import { createApp } from "vue";
import App from "./App.vue";
import { loadSettings } from "../../lib/settings.ts";
import { init, registerEvents, settingsStore } from "./neutralino-api";
import { createTeam } from "../../lib/team.ts";

async function initApp() {
    init();
    registerEvents();

    const { members, intervalSeconds } = await loadSettings(settingsStore);

    createApp(App, {
        team: [...createTeam(members)],
        intervalLengthInSeconds: intervalSeconds,
    }).mount("#app");
}

initApp();
