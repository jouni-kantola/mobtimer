import { createApp } from "vue";
import App from "./App.vue";
import { defaultMembers } from "./config";
import {
    getTeamData,
    init,
    registerEvents,
    saveTeam,
} from "./neutralino-api";
import { createTeam } from "./team";

async function initApp() {
    init();
    registerEvents();

    let members = defaultMembers;

    try {
        members = await getTeamData();
    } catch (err) {
        await saveTeam(defaultMembers);
    }

    createApp(App, {
        team: [...createTeam(members)],
    }).mount("#app");
}

initApp();
