import { defaultUsers, trayOptions } from "./config.js";
import { createTeam, generateMemberMarkup, whosNextAfter } from "./team.js";

Neutralino.init();

const timerValueElement = document.getElementById("timerValue");
const timerDisplayElement = document.getElementById("timerDisplay");
const startButtonElement = document.getElementById("startButton");

const state = {
    activeUserIndex: 1,
    getCurrentUser: () =>
        state.team.find(m => m.index === state.activeUserIndex),
    isRunning() {
        return !!state.clockIntervalId;
    },
    clockIntervalId: null,
    iterationLengthInSeconds: timerValueElement.value,
    secondsRemaining: timerValueElement.value,
    team: null,
};

function resetTimer() {
    clearInterval(state.clockIntervalId);
    state.clockIntervalId = null;
    state.secondsRemaining = state.iterationLengthInSeconds;
}

function formatTimeRemaining() {
    const minutes = Math.floor(state.secondsRemaining / 60);
    const seconds = state.secondsRemaining % 60;
    const timeLeft = `${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}`;
    return timeLeft;
}

function updateTimeDisplay() {
    timerDisplayElement.innerText = formatTimeRemaining();
}

async function updateTray() {
    const { name } = state.getCurrentUser();
    const nextMemberIndex = whosNextAfter(state.activeUserIndex, state.team);
    const nextMember = state.team.find(m => m.index === nextMemberIndex);
    await Neutralino.os.setTray({
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            {
                id: trayOptions.OPEN,
                text: "Open",
            },
            {
                text: "-",
            },
            {
                text: `Now: ${name}`,
            },
            {
                text: `Next: ${nextMember.name} (in ${formatTimeRemaining()})`,
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

async function saveUsers(users) {
    await Neutralino.storage.setData("mobUsers", JSON.stringify(users));
}

async function setCurrentUser() {
    const previousUser = document.querySelector(".user.current");
    if (previousUser) previousUser.classList.remove("current");

    const nextUser = document.querySelector(
        `.user[data-index="${state.activeUserIndex}"]`
    );
    nextUser.classList.add("current");

    const nextUserName = nextUser.querySelector("input[data-mob-user]").value;

    startButtonElement.innerText = `Start session for ${nextUserName}`;
}

async function onTick() {
    if (state.secondsRemaining-- > 0) {
        updateTimeDisplay();
        await updateTray();
    } else {
        resetTimer();

        state.activeUserIndex = whosNextAfter(
            state.activeUserIndex,
            state.team
        );

        await setCurrentUser();

        await Neutralino.window.show();
    }
}

timerValueElement.addEventListener("input", e => {
    state.secondsRemaining = Math.max(1, e.target.value);
    e.target.value = state.secondsRemaining;
    state.iterationLengthInSeconds = state.secondsRemaining;
    updateTimeDisplay();
});

startButtonElement.addEventListener("click", async () => {
    if (state.isRunning()) {
        await Neutralino.window.hide();
        return false;
    }

    startButtonElement.innerText = `Session running 🚀. Double click other user to switch/restart.`;

    const currentUser = document.querySelector(
        ".user.current input[type=text]"
    );
    await Neutralino.os.showNotification(
        "New session",
        `Let's go ${currentUser.value} 😘`
    );

    await Neutralino.window.hide();

    state.clockIntervalId = setInterval(onTick, 1000);
});

async function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case trayOptions.OPEN:
            await Neutralino.window.show();
            break;
        case trayOptions.QUIT:
            await Neutralino.app.exit();
            break;
    }
}

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);

async function initApp() {
    let users = defaultUsers;
    try {
        users = JSON.parse(await Neutralino.storage.getData("mobUsers"));
    } catch (err) {
        await saveUsers(defaultUsers);
    }

    state.team = createTeam(users);
    document.getElementById("mobUsers").innerHTML = generateMemberMarkup(
        state.team
    );

    document.querySelectorAll("input[data-mob-user]").forEach(u => {
        u.addEventListener("change", async () => {
            await saveUsers(
                Array.from(
                    document.querySelectorAll("input[data-mob-user]")
                ).map(x => x.value)
            );
        });

        u.addEventListener("dblclick", async udbclick => {
            if (!udbclick.target.previousElementSibling.checked) {
                return;
            }
            resetTimer();
            state.activeUserIndex = parseInt(
                udbclick.target.parentElement.dataset.index
            );
            await setCurrentUser();
            updateTimeDisplay();
        });
    });

    document.querySelectorAll(".user input[type=checkbox]").forEach(i => {
        i.addEventListener("change", () => {
            state.team[i.dataset.index - 1].isHere = i.checked;
        });
    });

    updateTimeDisplay();
    await setCurrentUser();
}

initApp();
