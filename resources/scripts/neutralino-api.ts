import {
    app,
    events,
    init as neuInit,
    os,
    storage,
    window as neuWindow,
} from "@neutralinojs/lib";
import type { Settings, SettingsStore } from "../../lib/settings.ts";
import { type Theme, isTheme } from "./theme.ts";
import type { StatusLabels } from "../../lib/status.ts";

const trayOptions = {
    OPEN: "OPEN",
    QUIT: "Quit",
};

export async function init() {
    neuInit();
    await neuWindow.setTitle(`Mob timer v${window.NL_APPVERSION}`);
}

export async function updateTray(labels: StatusLabels) {
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
                text: `Now: ${labels.now}`,
            },
            {
                text: `Next: ${labels.next} (in ${labels.timeLeft})`,
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

export async function saveTheme(theme: Theme) {
    await storage.setData("theme", JSON.stringify(theme));
}

export async function loadTheme(): Promise<Theme> {
    const theme = await getData("theme");
    return isTheme(theme) ? theme : "system";
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
    await app.killProcess();
}

export function registerEvents() {
    events.on("trayMenuItemClicked", onTrayMenuItemClicked);
    events.on("windowClose", quitApp);
}

async function getData(key: string) {
    try {
        return JSON.parse(await storage.getData(key));
    } catch {
        return undefined;
    }
}

export const settingsStore: SettingsStore = {
    async load(): Promise<Partial<Settings>> {
        return {
            members: await getData("mobUsers"),
            intervalSeconds: await getData("intervalLength"),
        };
    },
    saveMembers: saveTeam,
    saveInterval: saveIntervalLength,
};

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
