import { createApp } from "vue";
import App from "./App.vue";
import { defaultUsers } from "./config";
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

    let users = defaultUsers;

    try {
        users = await getTeamData();
    } catch (err) {
        await saveTeam(defaultUsers);
    }

    createApp(App, {
        team: [...createTeam(users)],
    }).mount("#app");
}

initApp();
