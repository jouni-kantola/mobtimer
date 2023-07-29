<template>
    <div class="team-member" :class="{ current: isActive }">
        <input type="checkbox" v-model="isHere" :data-index="index" role="switch" @click="ensureMinimumMembers"
            @change="toggleMemberHere">
        <input type="text" :value="name" :data-index="index" placeholder="Name" @dblclick="switchDriver"
            @input="updateMemberName" />
    </div>
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
    isActive: {
        type: Boolean,
        required: false,
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

<style scoped>
.team-member {
    grid-template-columns: 1fr minmax(auto, 95%);
    align-items: center;
    margin-bottom: var(--spacing);
}

.current input[type="text"] {
    background: linear-gradient(135deg, #bafdf7, #fcf4ac, #fbb7f3);
    animation: animate 2.5s linear infinite;
}

@keyframes animate {
    100% {
        filter: hue-rotate(360deg);
    }
}
</style>
