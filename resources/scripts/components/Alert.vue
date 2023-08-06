<template>
    <div class="alert">
        <p>{{ message }}</p>
        <button aria-label="Close" @click="close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps({
    message: {
        type: String,
        required: true
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    margin: 10px;
    background-color: var(--secondary);
    opacity: 0.9;
    border-radius: 3px;
}

p,
button {
    width: auto;
    margin: 0;
    color: var(--primary-inverse);
}

button {
    background-color: transparent;
    border: none;
    padding: 10px 0 10px 10px;
    font-weight: 600;
}

button:hover {
    color: var(--primary);
}
</style>