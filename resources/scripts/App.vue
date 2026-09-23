<template>
    <Timer
        :minutes="timeRemaining[0]"
        :seconds="timeRemaining[1]"
        @intervalUpdated="onIntervalUpdated"
        @enterKeyDown="start"
    />
    <button @click="onStartClick">
        {{ startButtonText }}
    </button>
    <div class="team-options">
        <TeamSize :teamSize="team.length" @updateTeamSize="updateTeamSize" />
        <button class="shuffle" @click="randomizeTeamOrder">Shuffle</button>
        <BreaksToggle @breaksToggled="toggleBreaks" />
        <ThemeToggle :theme="theme" @themeChanged="onThemeChanged" />
    </div>
    <form>
        <TeamMember
            v-for="{ id, name, index, isActive } in team"
            :key="id"
            :index="index"
            :name="name"
            :isActive="isActive"
            :onlyOneActiveMember="!canMarkAway(index, team)"
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
import { PropType, computed, reactive, ref } from "vue";

import Timer from "./components/Timer.vue";
import TeamMember from "./components/TeamMember.vue";
import BreaksToggle from "./components/BreaksToggle.vue";
import BreakAlert from "./components/BreakAlert.vue";
import ThemeToggle from "./components/ThemeToggle.vue";

import {
    updateTray,
    saveTeam,
    showWindow,
    hideWindow,
    saveIntervalLength,
    saveTheme,
} from "./neutralino-api";
import { type Theme, applyTheme } from "./theme.ts";
import { getActiveMember, type Member, canMarkAway } from "../../lib/team.ts";
import { formatTime } from "../../lib/clock.ts";
import { type SessionState, createSession } from "../../lib/session.ts";
import { statusLabels } from "../../lib/status.ts";
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
    theme: {
        type: String as PropType<Theme>,
        default: "system",
    },
});

const team = reactive(props.team);

const session = createSession(
    { team, intervalSeconds: props.intervalLengthInSeconds },
    { onChange: render, onTurnEnd: showWindow }
);

const timeRemaining = ref(session.state.timeRemaining);
const onBreak = ref(session.state.onBreak);
const status = ref(session.state.status);
const theme = ref(props.theme);

const startButtonText = computed(() => {
    if (status.value === "running") return "Pause";
    if (status.value === "paused") return "Resume";
    return `Start session for ${getActiveMember(team).name}`;
});

async function render(state: SessionState) {
    timeRemaining.value = state.timeRemaining;
    onBreak.value = state.onBreak;
    status.value = state.status;
    await updateTray(statusLabels(state));
}

async function onStartClick() {
    if (session.toggle()) await hideWindow();
}

async function start() {
    await hideWindow();
    session.start();
}

function endBreak() {
    session.endBreak();
}

async function onIntervalUpdated(seconds: number) {
    session.setInterval(seconds);
    await saveIntervalLength(seconds);
}

function switchDriver(selectedMemberIndex: number) {
    session.switchDriver(selectedMemberIndex);
}

async function updateMemberName(memberIndex: number, name: string) {
    session.renameMember(memberIndex, name);
    await saveTeam(team.map(m => m.name));
}

function toggleMemberHere(selectedMemberIndex: number, isHere: boolean) {
    session.setMemberHere(selectedMemberIndex, isHere);
}

function toggleBreaks(value: boolean) {
    session.setTakeBreaks(value);
}

async function updateTeamSize(newSize: number) {
    session.setTeamSize(newSize);
    await saveTeam(team.map(m => m.name));
}

async function onThemeChanged(newTheme: Theme) {
    theme.value = newTheme;
    applyTheme(newTheme);
    await saveTheme(newTheme);
}

async function randomizeTeamOrder() {
    session.shuffle();
    await saveTeam(team.map(m => m.name));
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
