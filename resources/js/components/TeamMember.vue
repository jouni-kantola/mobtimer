<template>
    <input type="checkbox" v-model="isHere" :data-index="index" role="switch" @click="ensureMinimumMembers"
        @change="toggleMemberHere">
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
    onlyOneActiveMember: {
        type: Boolean,
        required: false,
    },
});

const emit = defineEmits<{
    notifyMemberStatus: [number, boolean]
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
</script>
