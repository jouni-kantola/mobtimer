<template>
    <input type="checkbox" v-model="isHere" @change="toggleMemberHere">
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isHere = ref(true);

function toggleMemberHere(event: Event) {
    const isHereToggle = event.target as HTMLInputElement;
    isHere.value = isHereToggle.checked;
}
</script>
