<template>
    <input type="number" v-model="intervalLength" @input="onInput" @keydown="onKeydown" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
    intervalUpdated: [number]
    enterKeyDown: []
}>()

const intervalLength = ref(600);

function onInput(event: Event) {
    intervalLength.value = Math.max(1, parseInt((event.target as HTMLInputElement).value) || 1);
    emit("intervalUpdated", intervalLength.value)
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") emit("enterKeyDown");
}
</script>