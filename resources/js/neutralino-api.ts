import {
    app,
    events,
    init as neuInit,
    os,
    storage,
    window,
} from "@neutralinojs/lib";

const trayOptions = {
    OPEN: "OPEN",
    QUIT: "Quit",
};

export function init() {
    neuInit();
}

export async function updateTray(driverName, nextMemberName, timeRemaning) {
    await os.setTray({
        icon: "/dist/trayIcon.png",
        menuItems: [
            {
                id: trayOptions.OPEN,
                text: "Open",
            },
            {
                text: "-",
            },
            {
                text: `Now: ${driverName}`,
            },
            {
                text: `Next: ${nextMemberName} (in ${timeRemaning})`,
            },
            {
                text: "-",
            },
            {
                id: trayOptions.QUIT,
                text: "Quit",
            },
        ],
    });
}

export async function saveTeam(users) {
    await storage.setData("mobUsers", JSON.stringify(users));
}

export async function showWindow() {
    await window.show();
}

export async function hideWindow() {
    await window.hide();
}

export function registerEvents() {
    events.on("trayMenuItemClicked", onTrayMenuItemClicked);
}

export async function getTeamData() {
    return JSON.parse(await storage.getData("mobUsers"));
}

async function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case trayOptions.OPEN:
            await showWindow();
            break;
        case trayOptions.QUIT:
            await app.exit();
            break;
    }
}
