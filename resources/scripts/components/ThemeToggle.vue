<template>
    <button
        class="theme-toggle"
        :title="`Theme: ${display[theme].label} (click to change)`"
        :aria-label="`Theme: ${display[theme].label} (click to change)`"
        @click="emit('themeChanged', nextTheme(theme))"
    >
        <span
            v-for="option in themes"
            :key="option"
            :class="{ hidden: option !== theme }"
            :aria-hidden="option !== theme"
        >
            <span aria-hidden="true">{{ display[option].icon }}</span>
            {{ display[option].label }}
        </span>
    </button>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { type Theme, nextTheme, themes } from "../theme.ts";

defineProps({
    theme: {
        type: String as PropType<Theme>,
        required: true,
    },
});

const emit = defineEmits<{
    themeChanged: [Theme];
}>();

const display: Record<Theme, { icon: string; label: string }> = {
    system: { icon: "◐", label: "System" },
    light: { icon: "☀", label: "Light" },
    dark: { icon: "☾", label: "Dark" },
};
</script>

<style scoped>
.theme-toggle {
    width: auto;
    padding: 0 0.5rem;
    margin: 0;
    display: inline-grid;
}

.theme-toggle > span {
    grid-area: 1 / 1;
}

.theme-toggle > .hidden {
    visibility: hidden;
}
</style>
