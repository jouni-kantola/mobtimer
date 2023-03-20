import { defaultUsers, trayOptions } from "./config.js";
import {
    createTeam,
    generateMemberMarkup,
    whosNextAfter,
    switchActiveMember,
    getActiveMember,
} from "./team.js";

Neutralino.init();

const timerValueElement = document.getElementById("timerValue");
const timerDisplayElement = document.getElementById("timerDisplay");
const startButtonElement = document.getElementById("startButton");

const state = {
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
    updateTimeDisplay();
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
    const { index, name } = getActiveMember(state.team);
    const nextMember = whosNextAfter(index, state.team);
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

function prepareForNextMember() {
    const previous = document.querySelector(".user.current");
    previous.classList.remove("current");

    const { index, name } = getActiveMember(state.team);

    const next = document.querySelector(`.user[data-index="${index}"]`);
    next.classList.add("current");

    startButtonElement.innerText = `Start session for ${name}`;
}

async function onTick() {
    if (state.secondsRemaining-- > 0) {
        updateTimeDisplay();
        await updateTray();
    } else {
        resetTimer();

        const { index } = whosNextAfter(
            getActiveMember(state.team).index,
            state.team
        );

        switchActiveMember(index, state.team);
        prepareForNextMember();

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
            switchActiveMember(
                parseInt(udbclick.target.parentElement.dataset.index),
                state.team
            );
            prepareForNextMember();
        });
    });

    document.querySelectorAll(".user input[type=checkbox]").forEach(i => {
        i.addEventListener("change", () => {
            state.team[i.dataset.index - 1].isHere = i.checked;
        });
    });

    updateTimeDisplay();
    prepareForNextMember();
}

initApp();
