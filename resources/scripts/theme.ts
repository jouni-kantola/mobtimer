export type Theme = "system" | "light" | "dark";

export const themes: Theme[] = ["system", "light", "dark"];

export function isTheme(value: unknown): value is Theme {
    return themes.includes(value as Theme);
}

export function nextTheme(theme: Theme): Theme {
    return themes[(themes.indexOf(theme) + 1) % themes.length];
}

export function applyTheme(theme: Theme, root = document.documentElement) {
    // skip Pico's color transitions so all elements switch at once
    root.classList.add("theme-switching");

    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);

    // flush styles before transitions are re-enabled
    void root.offsetWidth;
    requestAnimationFrame(() => root.classList.remove("theme-switching"));
}
