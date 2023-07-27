<template>
    <input type="number" v-model="intervalLength" @input="onInput" @keydown="onKeydown" />
</template>

<script setup lang="ts">
import { defineEmits, ref } from "vue";

const emit = defineEmits(["intervalUpdated", "enterKeyDown"]);

const intervalLength = ref(600);

function onInput(event) {
    intervalLength.value = Math.max(1, event.target.value);
    emit('intervalUpdated', intervalLength.value)
}

function onKeydown(event) {
    if (event.key === "Enter") emit('enterKeyDown');
}
</script>