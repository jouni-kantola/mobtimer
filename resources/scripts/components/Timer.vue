<template>
    <div class="timer">
        <IntervalLength
            :value="minutes"
            :min="0"
            class="minutes"
            @intervalUpdated="updateIntervalByMinutes"
            @enterKeyDown="console.log('minutes')"
        />
        <span>:</span>
        <IntervalLength
            :value="seconds"
            :min="0"
            :max="59"
            class="seconds"
            @intervalUpdated="updateIntervalBySeconds"
            @enterKeyDown="console.log('seconds')"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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

function updateIntervalByMinutes(value: number) {
    const interval = value * 60 + seconds.value || 1;
    emit("intervalUpdated", interval);
}

function updateIntervalBySeconds(value: number) {
    const interval = minutes.value * 60 + value || 1;
    emit("intervalUpdated", interval);
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
    padding: 0 !important;
    margin: 0 !important;
    width: 3ch;
    height: 4.1rem !important;
    line-height: 4.1rem !important;
    text-align: right;
}

.timer input ~ input {
    text-align: left;
}

.timer span {
    margin-top: -0.15em;
}
</style>
