<template>
    <div class="team-member" :class="{ current: isActive }">
        <input type="checkbox" v-model="isHere" role="switch" @click="ensureMinimumMembers" @change="toggleMemberHere">
        <input type="text" :value="name" placeholder="Name" @dblclick="switchDriver" @input="updateMemberName" />
        <p v-if="tooltip" class="tooltip">{{ tooltip }}</p>
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
    tooltip: {
        type: String,
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
    position: relative;
}

.current input[type="text"] {
    background: linear-gradient(135deg, #bafdf7, #fcf4ac, #fbb7f3);
    animation: animate 2.5s linear infinite;
    font-weight: 600;
}

@keyframes animate {
    100% {
        filter: hue-rotate(360deg);
    }
}

.tooltip {
    position: absolute;
    top: 50%;
    right: 15px;
    margin: 0;
    padding: 10px;
    font-size: 0.6em;
    white-space: nowrap;
    pointer-events: none;
    transform: translateY(-50%);
    background-color: var(--primary);
    color: var(--primary-inverse);
    border-radius: 5px;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
}

.team-member:hover .tooltip {
    opacity: 0.9;
}

.tooltip:before {
    content: "";
    position: absolute;
    top: 7px;
    left: -20px;
    height: 0;
    width: 0;
    border: 10px solid transparent;
    border-right-color: var(--primary);
}
</style>
