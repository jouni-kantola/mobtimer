<template>
    <div class="team-size">
        <label for="team-size">Team size</label>
        <div class="size-control">
            <button @click="emit('updateTeamSize', teamSize + 1)">+</button>
            <input
                type="number"
                id="team-size"
                :value="teamSize"
                min="1"
                @change="onChange"
            />
            <button @click="emit('updateTeamSize', teamSize - 1)">-</button>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    teamSize: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits<{
    updateTeamSize: [number];
}>();

function onChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value) || 1;
    if (value !== props.teamSize) emit("updateTeamSize", value);
}
</script>

<style scoped>
.team-size,
.size-control {
    display: flex;
    align-items: center;
    justify-content: center;
}

.size-control {
    border: transparent;
    border-radius: 5px;
}

label {
    white-space: nowrap;
    margin-right: 5px;
}

button {
    border: 1px solid transparent;
    width: 30px;
    margin-bottom: 0;
    padding: 0;
}

input[type="number"] {
    border: transparent;
    -moz-appearance: textfield;
    text-align: center;
    width: 50px;
    padding: 0;
}

input[type="number"]:focus {
    font-weight: 600;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}
</style>
