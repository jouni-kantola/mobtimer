<template>
    <output>{{ value }}</output>
</template>

<script setup lang="ts">
defineProps({
    value: {
        type: String,
        required: true
    },
})
</script>

<style scoped>
output {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border: solid 1px #f2bfd7;
    border-radius: 5px;
    font-size: 4rem;
    background: linear-gradient(180deg,
            rgba(255, 255, 255, 0.25) 0%,
            #ffe4f1 100%);
}
</style>