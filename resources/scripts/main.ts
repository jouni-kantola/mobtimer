import { createApp } from "vue";
import App from "./App.vue";
import { defaultMembers } from "../../lib/config.ts";
import {
    getIntervalLength,
    getTeamData,
    init,
    registerEvents,
    saveIntervalLength,
    saveTeam,
} from "./neutralino-api";
import { createTeam } from "../../lib/team.ts";

async function initApp() {
    init();
    registerEvents();

    let members = defaultMembers;
    let intervalLengthInSeconds = 600;

    try {
        members = await getTeamData();
        intervalLengthInSeconds = await getIntervalLength();
    } catch (err) {
        await saveTeam(defaultMembers);
        await saveIntervalLength(intervalLengthInSeconds);
    }

    createApp(App, {
        team: [...createTeam(members)],
        intervalLengthInSeconds,
    }).mount("#app");
}

initApp();
