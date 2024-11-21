import {
    app,
    events,
    init as neuInit,
    os,
    storage,
    window as neuWindow,
} from "@neutralinojs/lib";

const trayOptions = {
    OPEN: "OPEN",
    QUIT: "Quit",
};

export async function init() {
    neuInit();
    await neuWindow.setTitle(`Mob timer v${window.NL_APPVERSION}`);
}

export async function updateTray(
    driverName: string,
    nextMemberName: string,
    timeRemaning: string
) {
    await os.setTray({
        icon: import.meta.env.DEV
            ? "/resources/public/trayIcon.png"
            : "/dist/trayIcon.png",
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
    if (await neuWindow.isMinimized()) {
        await neuWindow.unminimize();
    } else {
        await neuWindow.show();
    }
}

export async function hideWindow() {
    await neuWindow.hide();
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
