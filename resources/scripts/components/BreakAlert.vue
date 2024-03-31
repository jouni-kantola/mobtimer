<template>
    <div class="alert">
        <output>{{ timeLeft }}</output>
        <p>Break time</p>
        <p>🍵 Grab a tea!</p>
        <button aria-label="Close" @click="close">
            <span aria-hidden="true">&times;</span>
        </button>
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
    gap: 1rem;
}

p,
button,
output {
    width: auto;
    margin: 0;
    color: var(--primary-inverse);
    font-weight: 600;
    font-size: 3rem;
}

button {
    position: absolute;
    top: 0;
    right: 10px;
    background-color: transparent;
    border: none;
    padding: 0 10px 10px 10px;
    font-weight: 600;
}

button:hover {
    color: var(--primary);
}
</style>
