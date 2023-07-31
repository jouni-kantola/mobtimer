<template>
    <label
        >Take breaks
        <input
            v-model="takeBreaks"
            type="checkbox"
            role="switch"
            @change="onChange"
    /></label>
</template>

<script setup lang="ts">
import { ref } from "vue";

const takeBreaks = ref(true);

const emit = defineEmits<{
    breaksToggled: [boolean];
}>();

function onChange(event: Event) {
    takeBreaks.value = (event.target as HTMLInputElement).checked;
    emit("breaksToggled", takeBreaks.value);
}
</script>

<style scoped>
label {
    cursor: pointer;
}
</style>
