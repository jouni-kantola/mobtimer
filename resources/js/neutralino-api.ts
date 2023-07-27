const trayOptions = {
    OPEN: "OPEN",
    QUIT: "Quit",
};

export function init() {
    Neutralino.init();
}

export async function updateTray(
    driverName,
    nextMemberName,
    timeRemaning
) {
    await Neutralino.os.setTray({
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
    await Neutralino.storage.setData("mobUsers", JSON.stringify(users));
}

export async function showWindow() {
    await Neutralino.window.show();
}

export async function hideWindow() {
    await Neutralino.window.hide();
}

export function registerEvents() {
    Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
}

export async function getTeamData() {
    return JSON.parse(await Neutralino.storage.getData("mobUsers"));
}

async function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case trayOptions.OPEN:
            await showWindow();
            break;
        case trayOptions.QUIT:
            await Neutralino.app.exit();
            break;
    }
}
