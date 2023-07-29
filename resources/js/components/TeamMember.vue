<template>
    <input type="checkbox" v-model="isHere" :data-index="index" role="switch" @click="ensureMinimumMembers"
        @change="toggleMemberHere">
    <input type="text" :value="name" :data-index="index" placeholder="Name" @dblclick="switchDriver"
        @input="updateMemberName" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    onlyOneActiveMember: {
        type: Boolean,
        required: false,
    },
});

const emit = defineEmits<{
    notifyMemberStatus: [number, boolean]
    switchDriver: [number]
    updateMemberName: [number, string]
}>()

const isHere = ref(true);

function ensureMinimumMembers(event: Event) {
    const isHereToggle = event.target as HTMLInputElement;

    if (!isHereToggle.checked && props.onlyOneActiveMember) {
        event.preventDefault();
        return;
    }
}

function toggleMemberHere(event: Event) {
    const isHereToggle = event.target as HTMLInputElement;
    isHere.value = isHereToggle.checked;
    emit("notifyMemberStatus", props.index, isHere.value);
}

function switchDriver() {
    if (!isHere.value) return;

    emit("switchDriver", props.index);
}

function updateMemberName(event: Event) {
    const input = event.target as HTMLInputElement;
    const name = input.value;
    emit("updateMemberName", props.index, name);
}
</script>
