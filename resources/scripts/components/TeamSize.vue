<template>
    <div class="team-size">
        <label for="team-size">Team size</label>
        <button @click="emit('increase')">+</button>
        <input
            type="number"
            id="team-size"
            :value="teamSize"
            min="1"
            @change="onChange"
        />
        <button @click="emit('decrease')">-</button>
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
    increase: [];
    decrease: [];
}>();

function onChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (value < props.teamSize) emit("decrease");
    else if (value > props.teamSize) emit("increase");
}
</script>

<style scoped>
.team-size {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

label {
    white-space: nowrap;
    margin-right: 5px;
}

button {
    margin-bottom: 0;
}
</style>
