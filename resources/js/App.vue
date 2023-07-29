<template>
    <Timer :value="formattedTimeRemaining" />
    <div class="cycle-settings">
        <IntervalLength @intervalUpdated="onIntervalUpdated" @enterKeyDown="onIntervalLengthEnterKeyDown" />
        <label>Take breaks <input v-model="takeBreaks" type="checkbox" role="switch" /></label>
    </div>
    <div class="grid">
        <button @click="startSession">{{ startButtonText }}</button>
        <button @click="pauseButtonElementClick">{{ isPaused ? "Resume" : "Pause" }}</button>
    </div>
    <form>
        <TeamMember v-for="({ name, index, isActive }) in team" :index="index" :name="name" :isActive="isActive"
            :onlyOneActiveMember="team.filter(m => m.isHere).length === 1" @notifyMemberStatus="toggleMemberHere"
            @switchDriver="switchDriver" @updateMemberName="updateMemberName" class="grid" />
    </form>
</template>
<script setup lang="ts">
import { PropType, reactive, ref } from "vue";

import Timer from "./components/Timer.vue";
import IntervalLength from "./components/IntervalLength.vue";
import TeamMember from "./components/TeamMember.vue";

import { updateTray, saveTeam, showWindow, hideWindow } from "./neutralino-api";
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
});

const takeBreaks = ref(true);
const startButtonText = ref("Start");
const isPaused = ref(false);
const team = reactive(props.team);

const state: {
    timer: ReturnType<typeof startTimer> | null;
    iterationLengthInSeconds: number;
    onBreak: boolean;
} = {
    timer: null,
    iterationLengthInSeconds: 600,
    onBreak: false,
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

function prepareForNextMember() {
    const { name } = getActiveMember(team);
    startButtonText.value = `Start session for ${name}`;
}

async function onTick() {
    updateTimeDisplay();
    const { index, name } = getActiveMember(team);
    const nextMember = whosNextAfter(index, team);
    const timeRemaning = formatTimeRemaining();
    await updateTray(name, nextMember.name, timeRemaning);
}

async function onBreakTick() {
    updateTimeDisplay();
    const { index } = getActiveMember(team);
    const nextMember = whosNextAfter(index, team);
    const timeRemaning = formatTimeRemaining();
    await updateTray("Break", nextMember.name, timeRemaning);
}

async function onEnd() {
    if (
        takeBreaks.value
        && getLast(team).index == getActiveMember(team).index
        && !state.onBreak) {
        state.onBreak = true;
        state.timer = startTimer(
            state.iterationLengthInSeconds,
            onBreakTick,
            onEnd);
        startButtonText.value = "Take a break!";

        await showWindow();
    } else {
        state.onBreak = false;
        updateTimeDisplay();

        const { index } = whosNextAfter(
            getActiveMember(team).index,
            team
        );

        switchActiveMember(index, team);
        prepareForNextMember();

        await showWindow();
    }
}

function onIntervalUpdated(intervalLength: number) {
    state.iterationLengthInSeconds = intervalLength;
    state.timer?.change(intervalLength);
    updateTimeDisplay();
}

function onIntervalLengthEnterKeyDown() {
    if (!state.timer?.isRunning) startSession();
}

async function startSession() {
    await hideWindow();

    if (state.timer?.isRunning) return false;

    startButtonText.value = `Session running 🚀. Double click any user to switch/restart.`;

    state.timer = startTimer(state.iterationLengthInSeconds, onTick, onEnd);

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
    updateTimeDisplay();
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
        updateTimeDisplay();

        const { index } = whosNextAfter(activeMember.index, team);
        switchActiveMember(index, team);
        prepareForNextMember();
    }
}
</script>

<style scoped>
.cycle-settings {
    display: flex;
    gap: 15px;
    white-space: nowrap;
}
</style>
