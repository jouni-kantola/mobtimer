import { createApp } from "vue";
import App from "./App.vue";
import { defaultUsers } from "./config.js";
import { getTeamData, init, saveTeam } from "./neutralino-api.js";
import { createTeam } from "./team.js";

init();

async function initApp() {
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
