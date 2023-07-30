<template>
    <input
        type="text"
        :value="paddedValue"
        @input="onInput"
        @keydown="onKeyDown"
    />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
    value: {
        type: Number,
        required: true,
    },
    min: {
        type: Number,
        default: 0,
    },
    max: {
        type: Number,
        default: Infinity,
    },
});

const paddedValue = computed(() => {
    const val = props.value > props.min ? props.value : props.min;
    return String(Math.min(props.max, val)).padStart(2, "0");
});

const emit = defineEmits<{
    intervalUpdated: [number];
    enterKeyDown: [];
}>();

function onInput(event: Event) {
    const intervalLength = Math.min(
        props.max,
        Math.max(
            props.min,
            parseInt((event.target as HTMLInputElement).value) || props.min
        )
    );
    emit("intervalUpdated", intervalLength);
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") emit("enterKeyDown");
}
</script>
