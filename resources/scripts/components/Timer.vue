<template>
    <div class="timer">
        <button
            class="minutes"
            @click="toggleMinutesSetting"
            v-if="!displayMinutesSetting"
        >
            {{ minutes.toString().padStart(2, "0") }}
        </button>
        <IntervalLength
            v-else
            :value="minutes"
            :min="0"
            class="minutes"
            @intervalUpdated="updateIntervalByMinutes"
            @enterKeyDown="toggleMinutesSetting"
            @blur="toggleMinutesSetting"
        />
        <span>:</span>
        <button
            class="seconds"
            @click="toggleSecondsSetting"
            v-if="!displaySecondsSetting"
        >
            {{ seconds.toString().padStart(2, "0") }}
        </button>
        <IntervalLength
            v-else
            :value="seconds"
            :min="0"
            :max="59"
            class="seconds"
            @intervalUpdated="updateIntervalBySeconds"
            @enterKeyDown="toggleSecondsSetting"
            @blur="toggleSecondsSetting"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import IntervalLength from "./IntervalLength.vue";

const emit = defineEmits<{
    intervalUpdated: [number];
}>();

const props = defineProps({
    value: {
        type: String,
        required: true,
    },
});

const minutes = computed(() => +props.value.split(":")[0]);
const seconds = computed(() => +props.value.split(":")[1]);
const displayMinutesSetting = ref(false);
const displaySecondsSetting = ref(false);

function updateIntervalByMinutes(value: number) {
    const interval = value * 60 + seconds.value || 1;
    emit("intervalUpdated", interval);
}

function updateIntervalBySeconds(value: number) {
    const interval = minutes.value * 60 + value || 1;
    emit("intervalUpdated", interval);
}

function toggleMinutesSetting() {
    displayMinutesSetting.value = !displayMinutesSetting.value;
}

function toggleSecondsSetting() {
    displaySecondsSetting.value = !displaySecondsSetting.value;
}
</script>

<style scoped>
.timer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border: solid 1px #f2bfd7;
    border-radius: 5px;
    font-size: 4rem;
    background: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.25) 0%,
        #ffe4f1 100%
    );
}

.timer button {
    cursor: text;
}

.timer button:hover,
.timer input:hover,
.timer button:focus,
.timer input:focus {
    font-weight: 600;
}

.timer input,
.timer button {
    display: block;
    font-size: 4rem;
    border: transparent;
    background-color: transparent;
    color: inherit;
    padding: 0 !important;
    margin: 0 !important;
    width: 3ch;
    height: 4.1rem !important;
    line-height: 4.1rem !important;
}

.timer button,
.timer input {
    text-align: right;
}

.timer button {
    outline: 3px solid transparent;
}

.timer button ~ button,
.timer input ~ button,
.timer button ~ input {
    text-align: left;
}

.timer span {
    margin-top: -0.15em;
}
</style>
