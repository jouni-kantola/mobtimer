<template>
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
        <button class="shuffle" @click="randomizeTeamOrder">Shuffle</button>
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

    <Transition name="fade">
        <BreakAlert
            v-if="onBreak"
            :timeLeft="`${formatTime(timeRemaining)}`"
            @alertClosed="endBreak"
        />
    </Transition>
</template>
<script setup lang="ts">
import { PropType, reactive, ref } from "vue";

import Timer from "./components/Timer.vue";
import TeamMember from "./components/TeamMember.vue";
import BreaksToggle from "./components/BreaksToggle.vue";
import BreakAlert from "./components/BreakAlert.vue";

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
    shuffleTeam,
    whosNext,
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
const intervalLength = ref(props.intervalLengthInSeconds);
const timer = ref<ReturnType<typeof startTimer> | null>(null);
const onBreak = ref(false);

let isPaused = false;

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

async function prepareForNextMember() {
    const activeMember = getActiveMember(team);
    startButtonText.value = `Start session for ${activeMember.name}`;
    await updateTrayStatus();
}

async function onTick(timeLeft: TimeRemaining) {
    updateTimeDisplay(timeLeft);
    await updateTrayStatus();
}

async function onEnd() {
    if (isBreakNext()) {
        onBreak.value = true;
        resetTimeDisplay();
        timer.value = startTimer(intervalLength.value, onTick, onEnd);

        await showWindow();
    } else {
        endBreak();

        await showWindow();
    }
}

function isBreakNext() {
    return (
        takeBreaks.value &&
        getLast(team).index == getActiveMember(team).index &&
        !onBreak.value
    );
}

function endBreak() {
    onBreak.value = false;

    timer?.value?.reset();
    timer.value = null;

    resetTimeDisplay();

    const { index } = whosNext(team);

    switchActiveMember(index, team);
    prepareForNextMember();
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

async function randomizeTeamOrder() {
    shuffleTeam(team);
    await saveTeam(team.map(m => m.name));
}

async function updateTrayStatus() {
    const now = onBreak.value ? "Break" : getActiveMember(team).name;
    const next = isBreakNext() ? "Break" : whosNext(team).name;
    await updateTray(now, next, formatTime(timeRemaining.value));
}
</script>

<style scoped>
.team-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.team-options label {
    margin-bottom: 0;
}

.shuffle {
    width: auto;
    padding: 0 0.5rem;
    margin: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease-in;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
