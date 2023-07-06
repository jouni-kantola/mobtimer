<template>
    <Timer :value="formattedTimeRemaining" />
    <div class="cycle-settings">
        <input type="number" v-model="timerValue" @input="timerValueElementInput" @keydown="timerValueElementKeyDown" />
        <label>Take breaks <input v-model="takeBreaks" type="checkbox" role="switch" checked /></label>
    </div>
</template>
<script setup>
import { ref } from "vue";

import Timer from "./components/Timer.vue";

import { defaultUsers, trayOptions } from "./config.js";
import {
    createTeam,
    generateMemberMarkup,
    whosNextAfter,
    switchActiveMember,
    getActiveMember,
    getLast,
} from "./team.js";
import { secondsToMinutesAndSeconds, startTimer } from "./clock.js";

const timerValue = ref(600);
const takeBreaks = ref(true);

const startButtonElement = document.getElementById("startButton");
const pauseButtonElement = document.getElementById("pauseButton");

const state = {
    timer: null,
    iterationLengthInSeconds: timerValue.value,
    team: null,
    onBreak: false,
    isPaused: false,
};

const formattedTimeRemaining = ref(formatTimeRemaining());

function formatTimeRemaining() {
    return state.timer?.isRunning
        ? state.timer.timeLeft
        : secondsToMinutesAndSeconds(state.iterationLengthInSeconds);
}

function updateTimeDisplay() {
    formattedTimeRemaining.value = formatTimeRemaining();
}

async function updateTray(
    driverName,
    nextMemberName,
    timeRemaning
) {
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

async function saveTeam(users) {
    await Neutralino.storage.setData("mobUsers", JSON.stringify(users));
}

function prepareForNextMember() {
    const previous = document.querySelector(".user.current");
    const { index, name } = getActiveMember(state.team);
    const next = document.querySelector(`.user[data-index="${index}"]`);

    requestAnimationFrame(() => {
        previous.classList.remove("current");
        next.classList.add("current");
        startButtonElement.innerText = `Start session for ${name}`;
    });
}

async function onTick() {
    updateTimeDisplay();
    const { index, name } = getActiveMember(state.team);
    const nextMember = whosNextAfter(index, state.team);
    const timeRemaning = formatTimeRemaining();
    await updateTray(name, nextMember.name, timeRemaning);
}

async function onBreakTick() {
    updateTimeDisplay();
    const { index, _ } = getActiveMember(state.team);
    const nextMember = whosNextAfter(index, state.team);
    const timeRemaning = formatTimeRemaining();
    await updateTray("Break", nextMember.name, timeRemaning);
}

async function onEnd() {
    if (
        takeBreaks.value
        && getLast(state.team).index == getActiveMember(state.team).index
        && !state.onBreak) {
        state.onBreak = true;
        state.timer = startTimer(
            state.iterationLengthInSeconds,
            onBreakTick,
            onEnd);
        startButtonElement.innerText = "Take a break!";

        await Neutralino.window.show();
    } else {
        state.onBreak = false;
        updateTimeDisplay();

        const { index } = whosNextAfter(
            getActiveMember(state.team).index,
            state.team
        );

        switchActiveMember(index, state.team);
        prepareForNextMember();

        await Neutralino.window.show();
    }
}

function timerValueElementInput(e) {
    state.iterationLengthInSeconds = Math.max(1, e.target.value);
    timerValue.value = state.iterationLengthInSeconds;
    state.timer?.change(state.iterationLengthInSeconds);
    updateTimeDisplay();
}

function timerValueElementKeyDown(event) {
    if (event.key === "Enter" && !state.timer?.isRunning) startSession();
}

async function startSession() {
    await Neutralino.window.hide();

    if (state.timer?.isRunning) return false;

    startButtonElement.innerText = `Session running 🚀. Double click any user to switch/restart.`;

    state.timer = startTimer(state.iterationLengthInSeconds, onTick, onEnd);

    state.isPaused = false;
    pauseButtonElement.innerText = "Pause";
}

startButtonElement.addEventListener("click", startSession);

pauseButtonElement.addEventListener("click", () => {
    if (state.timer?.isRunning) {
        state.timer.pause();
        pauseButtonElement.innerText = "Resume";
        state.isPaused = true;
    } else if (state.isPaused) {
        state.timer.start();
        pauseButtonElement.innerText = "Pause";
        state.isPaused = false;
    }
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
        await saveTeam(defaultUsers);
    }

    state.team = createTeam(users);
    document.getElementById("mobUsers").innerHTML = generateMemberMarkup(
        state.team
    );

    document.querySelectorAll("input[data-mob-user]").forEach(u => {
        let debounceTimeout;
        u.addEventListener("input", event => {
            const memberIndex = parseInt(
                event.target.parentElement.dataset.index
            );

            if (memberIndex === getActiveMember(state.team).index) {
                requestAnimationFrame(() => {
                    startButtonElement.innerText = `Start session for ${event.target.value}`;
                });
            }

            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                state.team[memberIndex].name = event.target.value;
                await saveTeam(state.team.map(m => m.name));
            }, 500);
        });

        u.addEventListener("dblclick", async udbclick => {
            if (!udbclick.target.previousElementSibling.checked) {
                return;
            }

            state.timer?.reset();

            updateTimeDisplay();
            switchActiveMember(
                parseInt(udbclick.target.parentElement.dataset.index),
                state.team
            );
            prepareForNextMember();
            state.isPaused = false;
            pauseButtonElement.innerText = "Pause";
        });
    });

    document.querySelectorAll(".user input[type=checkbox]").forEach(i => {
        i.addEventListener("click", event => {
            const checkbox = event.target;
            const isHere = checkbox.checked;

            if (!isHere && state.team.filter(m => m.isHere).length === 1) {
                event.preventDefault();
                return false;
            }
        });

        i.addEventListener("change", event => {
            const checkbox = event.target;
            const selectedMemberIndex = parseInt(checkbox.dataset.index);
            const isHere = checkbox.checked;
            const activeMember = getActiveMember(state.team);

            state.team[selectedMemberIndex].isHere = isHere;

            if (activeMember.index === selectedMemberIndex && !isHere) {
                state.timer?.reset();
                updateTimeDisplay();

                const { index } = whosNextAfter(activeMember.index, state.team);
                switchActiveMember(index, state.team);
                prepareForNextMember();
            }
        });
    });

    updateTimeDisplay();
    prepareForNextMember();
}

initApp();

</script>

<style scoped>
.cycle-settings {
    display: flex;
    gap: 15px;
    white-space: nowrap;
}
</style>
