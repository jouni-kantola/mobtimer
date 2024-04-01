<template>
    <div class="alert">
        <h1>🍵 Break</h1>
        <output class="timer">{{ timeLeft }}</output>
        <button class="close" aria-label="Close" @click="close">
            <span aria-hidden="true">&times;</span>
        </button>
        <button @click="close">Skip break</button>
    </div>
</template>

<script setup lang="ts">
defineProps({
    timeLeft: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(["alertClosed"]);

function close() {
    emit("alertClosed");
}
</script>

<style scoped>
.alert {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 20px;
    margin: 10px;
    background-color: var(--secondary);
    border-radius: 3px;
    z-index: 1;
    text-align: center;
    gap: 3rem;
}

.timer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border: 3px solid var(--primary-inverse);
    border-radius: 100px;
    font-size: 6rem;
    color: var(--primary-inverse);
    width: 100%;
    font-weight: 600;
}

h1,
p,
button {
    color: var(--primary-inverse);
    font-size: 3rem;
    font-weight: 400;
    margin: 0;
}

.close {
    position: absolute;
    top: 0;
    right: 10px;
    width: auto;
    background-color: transparent;
    border: none;
    padding: 0 10px 10px 10px;
}

.close:hover,
.close:active {
    color: var(--primary);
}
</style>
