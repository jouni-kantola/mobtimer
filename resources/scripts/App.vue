<template>
    <Alert v-if="information" :message="information" @alertClosed="information = ''" />
    <div class="cycle-settings">
        <Timer :minutes="timeRemaining[0]" :seconds="timeRemaining[1]" @intervalUpdated="onIntervalUpdated"
            @enterKeyDown="startSession" />
        <BreaksToggle @breaksToggled="toggleBreaks" />
    </div>
    <div class="grid">
        <button @click="startSession">{{ startButtonText }}</button>
        <button @click="pauseButtonElementClick">
            {{ isPaused ? "Resume" : "Pause" }}
        </button>
    </div>
    <form>
        <TeamMember v-for="{ name, index, isActive } in team" :index="index" :name="name" :isActive="isActive"
            :onlyOneActiveMember="team.filter(m => m.isHere).length === 1" @notifyMemberStatus="toggleMemberHere"
            @switchDriver="switchDriver" @updateMemberName="updateMemberName" tooltip="Set to driver with Enter key or double-click"
            class="grid" />
    </form>
</template>
<script setup lang="ts">
import { PropType, reactive, ref } from "vue";

import Timer from "./components/Timer.vue";
import TeamMember from "./components/TeamMember.vue";
import BreaksToggle from "./components/BreaksToggle.vue";
import Alert from "./components/Alert.vue";

import {
    updateTray,
    saveTeam,
    showWindow,
    hideWindow,
    saveIntervalLength,
} from "./neutralino-api";
import {
    whosNextAfter,
    switchActiveMember,
    getActiveMember,
    getLast,
    type Member,
} from "./team";
import { secondsToMinutesAndSeconds, startTimer } from "./clock";

const props = defineProps({
    team: {
        type: Array as PropType<Array<Member>>,
        required: true,
    },
    intervalLengthInSeconds: {
        type: Number,
        required: true,
    },
});

const takeBreaks = ref(true);
const startButtonText = ref("Start");
const isPaused = ref(false);
const team = reactive(props.team);
const information = ref("");
const intervalLength = ref(props.intervalLengthInSeconds);

const state: {
    timer: ReturnType<typeof startTimer> | null;
    onBreak: boolean;
} = {
    timer: null,
    onBreak: false,
};

const timeRemaining = ref(secondsToMinutesAndSeconds(intervalLength.value));

function updateTimeDisplay(timeLeft: [number, number]) {
    timeRemaining.value = timeLeft;
}

function resetTimeDisplay() {
    updateTimeDisplay(secondsToMinutesAndSeconds(intervalLength.value));
}

function formatTime([minutes, seconds]: [number, number]) {
    return `${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}`;
}

function prepareForNextMember() {
    const { name } = getActiveMember(team);
    startButtonText.value = `Start session for ${name}`;
}

async function onTick(timeLeft: [number, number]) {
    updateTimeDisplay(timeLeft);
    const { index, name } = getActiveMember(team);
    const nextMember = whosNextAfter(index, team);
    await updateTray(name, nextMember.name, formatTime(timeLeft));
}

async function onBreakTick(timeLeft: [number, number]) {
    updateTimeDisplay(timeLeft);
    const { index } = getActiveMember(team);
    const nextMember = whosNextAfter(index, team);
    await updateTray("Break", nextMember.name, formatTime(timeLeft));
}

async function onEnd() {
    if (
        takeBreaks.value &&
        getLast(team).index == getActiveMember(team).index &&
        !state.onBreak
    ) {
        state.onBreak = true;
        state.timer = startTimer(
            intervalLength.value,
            onBreakTick,
            onEnd
        );
        information.value = "🍵 Break time. Grab a tea!";

        await showWindow();
    } else {
        state.onBreak = false;
        resetTimeDisplay();

        const { index } = whosNextAfter(getActiveMember(team).index, team);

        switchActiveMember(index, team);
        prepareForNextMember();

        await showWindow();
    }
}

function onIntervalUpdated(seconds: number) {
    intervalLength.value = seconds;
    state.timer?.change(intervalLength.value);
    resetTimeDisplay();
    saveIntervalLength(intervalLength.value);
}

async function startSession() {
    await hideWindow();

    if (state.timer?.isRunning) return false;

    startButtonText.value = "Hide window";

    state.timer = startTimer(intervalLength.value, onTick, onEnd);

    isPaused.value = false;
}

function pauseButtonElementClick() {
    if (!state.timer) return;

    if (state.timer.isRunning) {
        state.timer.pause();
        isPaused.value = true;
    } else if (isPaused.value) {
        state.timer.start();
        isPaused.value = false;
    }
}

function switchDriver(selectedMemberIndex: number) {
    state.timer?.reset();
    resetTimeDisplay();
    switchActiveMember(selectedMemberIndex, team);
    prepareForNextMember();
    isPaused.value = false;
}

async function updateMemberName(memberIndex: number, name: string) {
    if (memberIndex === getActiveMember(team).index) {
        startButtonText.value = `Start session for ${name}`;
    }

    team[memberIndex].name = name;
    await saveTeam(team.map(m => m.name));
}

function toggleMemberHere(selectedMemberIndex: number, isHere: boolean) {
    const activeMember = getActiveMember(team);

    team[selectedMemberIndex].isHere = isHere;

    if (activeMember.index === selectedMemberIndex && !isHere) {
        state.timer?.reset();
        resetTimeDisplay();

        const { index } = whosNextAfter(activeMember.index, team);
        switchActiveMember(index, team);
        prepareForNextMember();
    }
}

function toggleBreaks(value: boolean) {
    takeBreaks.value = value;
}
</script>

<style scoped>
.cycle-settings {
    display: grid;
    grid-template-columns: 0.8fr 0.2fr;
    align-items: start;
    gap: 15px;
}
</style>
