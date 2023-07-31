<template>
    <input
        type="text"
        ref="input"
        :value="paddedValue"
        @input="onInput"
        @keydown="onKeyDown"
    />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

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
    else if (event.key === "ArrowUp") {
        const intervalLength = Math.min(
            props.max,
            Math.max(props.min, props.value + 1)
        );
        emit("intervalUpdated", intervalLength);
    } else if (event.key === "ArrowDown") {
        const intervalLength = Math.min(
            props.max,
            Math.max(props.min, props.value - 1)
        );
        emit("intervalUpdated", intervalLength);
    }
}

const input = ref<HTMLInputElement | null>(null);

onMounted(() => {
    input.value?.focus();
});
</script>
