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

export async function init() {
    neuInit();
    // @ts-expect-error
    await window.setTitle(`Mob timer v${NL_APPVERSION}`);
}

export async function updateTray(
    driverName: string,
    nextMemberName: string,
    timeRemaning: string
) {
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

export async function saveTeam(members: string[]) {
    await storage.setData("mobUsers", JSON.stringify(members));
}

export async function saveIntervalLength(seconds: number) {
    await storage.setData("intervalLength", JSON.stringify(seconds));
}

export async function showWindow() {
    await window.show();
}

export async function hideWindow() {
    await window.hide();
}

async function quitApp() {
    await app.exit();
}

export function registerEvents() {
    events.on("trayMenuItemClicked", onTrayMenuItemClicked);
    events.on("windowClose", quitApp);
}

export async function getTeamData(): Promise<string[]> {
    return JSON.parse(await storage.getData("mobUsers"));
}

export async function getIntervalLength(): Promise<number> {
    return JSON.parse(await storage.getData("intervalLength"));
}

async function onTrayMenuItemClicked(event: CustomEvent) {
    switch (event.detail.id) {
        case trayOptions.OPEN:
            await showWindow();
            break;
        case trayOptions.QUIT:
            await quitApp();
            break;
    }
}
