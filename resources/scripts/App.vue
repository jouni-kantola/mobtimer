<template>
    <Alert
        v-if="information"
        :message="information"
        @alertClosed="information = ''"
    />
    <Timer
        :minutes="timeRemaining[0]"
        :seconds="timeRemaining[1]"
        @intervalUpdated="onIntervalUpdated"
        @enterKeyDown="start"
    />
    <button @click="() => (!timer ? start() : pause())">
        {{ startButtonText }}
    </button>
    <div class="team-options">
        <TeamSize :teamSize="team.length" @updateTeamSize="updateTeamSize" />
        <BreaksToggle @breaksToggled="toggleBreaks" />
    </div>
    <form>
        <TeamMember
            v-for="{ name, index, isActive } in team"
            :index="index"
            :name="name"
            :isActive="isActive"
            :onlyOneActiveMember="team.filter(m => m.isHere).length === 1"
            @notifyMemberStatus="toggleMemberHere"
            @switchDriver="switchDriver"
            @updateMemberName="updateMemberName"
            tooltip="Set to driver with Enter key or double-click"
            class="grid"
        />
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
    adjustTeamSize,
} from "./team";
import {
    type TimeRemaining,
    secondsToMinutesAndSeconds,
    startTimer,
} from "./clock";
import TeamSize from "./components/TeamSize.vue";

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
const team = reactive(props.team);
const information = ref("");
const intervalLength = ref(props.intervalLengthInSeconds);
const timer = ref<ReturnType<typeof startTimer> | null>(null);

let isPaused = false;

const state: {
    onBreak: boolean;
} = {
    onBreak: false,
};

const timeRemaining = ref(secondsToMinutesAndSeconds(intervalLength.value));

function updateTimeDisplay(timeLeft: TimeRemaining) {
    timeRemaining.value = timeLeft;
}

function resetTimeDisplay() {
    updateTimeDisplay(secondsToMinutesAndSeconds(intervalLength.value));
}

function formatTime([minutes, seconds]: TimeRemaining) {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
    )}`;
}

function prepareForNextMember() {
    const { name } = getActiveMember(team);
    startButtonText.value = `Start session for ${name}`;
}

async function onTick(timeLeft: TimeRemaining) {
    updateTimeDisplay(timeLeft);
    const { index, name } = getActiveMember(team);
    const nextMember = whosNextAfter(index, team);
    await updateTray(name, nextMember.name, formatTime(timeLeft));
}

async function onBreakTick(timeLeft: TimeRemaining) {
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
        resetTimeDisplay();
        timer.value = startTimer(intervalLength.value, onBreakTick, onEnd);
        information.value = "🍵 Break time. Grab a tea!";

        await showWindow();
    } else {
        state.onBreak = false;
        timer.value = null;
        resetTimeDisplay();

        const { index } = whosNextAfter(getActiveMember(team).index, team);

        switchActiveMember(index, team);
        prepareForNextMember();

        await showWindow();
    }
}

function onIntervalUpdated(seconds: number) {
    intervalLength.value = seconds;
    timer.value?.change(intervalLength.value);
    resetTimeDisplay();
    saveIntervalLength(intervalLength.value);
}

async function start() {
    await hideWindow();

    if (isPaused || timer.value?.isRunning) return false;

    startButtonText.value = "Pause";

    timer.value = startTimer(intervalLength.value, onTick, onEnd);

    isPaused = false;
}

function pause() {
    if (!timer.value) return;

    if (timer.value.isRunning) {
        timer.value.pause();
        isPaused = true;
        startButtonText.value = "Resume";
    } else if (isPaused) {
        timer.value.start();
        isPaused = false;
        startButtonText.value = "Pause";
    }
}

function switchDriver(selectedMemberIndex: number) {
    timer.value?.reset();
    timer.value = null;
    resetTimeDisplay();
    switchActiveMember(selectedMemberIndex, team);
    prepareForNextMember();
    isPaused = false;
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
        timer.value?.reset();
        resetTimeDisplay();

        const { index } = whosNextAfter(activeMember.index, team);
        switchActiveMember(index, team);
        prepareForNextMember();
    }
}

function toggleBreaks(value: boolean) {
    takeBreaks.value = value;
}

async function updateTeamSize(newSize: number) {
    adjustTeamSize(team, newSize);
    await saveTeam(team.map(m => m.name));
}
</script>

<style scoped>
.team-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.team-options label {
    margin-bottom: 0;
}
</style>
