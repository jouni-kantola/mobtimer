<template>
    <div id="timerDisplay">{{ value }}</div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    value: {
        type: String,
        required: true
    },
})
</script>

<style scoped>
#timerDisplay {
    padding: 15px;
    border: solid 1px #f2bfd7;
    border-radius: 5px;
    text-align: center;
    font-size: 4rem;
    background: linear-gradient(180deg,
            rgba(255, 255, 255, 0.25) 0%,
            #ffe4f1 100%);
}
</style>