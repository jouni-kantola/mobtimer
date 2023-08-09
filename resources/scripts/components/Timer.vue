<template>
    <div class="timer">
        <IntervalLength
            :value="minutes"
            :min="0"
            class="minutes"
            @intervalUpdated="updateIntervalByMinutes"
            @enterKeyDown="$emit('enterKeyDown')"
        />
        <span>:</span>
        <IntervalLength
            :value="seconds"
            :min="0"
            :max="59"
            class="seconds"
            @intervalUpdated="updateIntervalBySeconds"
            @enterKeyDown="$emit('enterKeyDown')"
        />
    </div>
</template>

<script setup lang="ts">
import IntervalLength from "./IntervalLength.vue";

const emit = defineEmits<{
    intervalUpdated: [number];
    enterKeyDown: [];
}>();

const props = defineProps({
    minutes: {
        type: Number,
        required: true,
    },
    seconds: {
        type: Number,
        required: true,
    },
});

function updateIntervalByMinutes(value: number) {
    const interval = value * 60 + props.seconds || 1;
    emit("intervalUpdated", interval);
}

function updateIntervalBySeconds(value: number) {
    const interval = props.minutes * 60 + value || 1;
    emit("intervalUpdated", interval);
}
</script>

<style scoped>
.timer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border: 3px solid var(--primary);
    border-radius: 100px;
    font-size: 4rem;
}

.timer input:hover,
.timer input:focus {
    font-weight: 600;
}

.timer input {
    display: block;
    font-size: 4rem;
    border: transparent;
    background-color: transparent;
    color: inherit;
    padding: 3px !important;
    margin: 0 !important;
    width: 3ch;
    height: 5rem !important;
    line-height: 5rem !important;
    text-align: right;
}

.timer input ~ input {
    text-align: left;
}

.timer span {
    margin-top: -0.2em;
}
</style>
