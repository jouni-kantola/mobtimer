import { afterEach, assert, test, vi } from "vitest";
import { applyTheme, isTheme, nextTheme } from "../resources/scripts/theme.ts";

test("cycles system, light, dark", () => {
    assert.strictEqual(nextTheme("system"), "light");
    assert.strictEqual(nextTheme("light"), "dark");
    assert.strictEqual(nextTheme("dark"), "system");
});

test("recognizes valid themes only", () => {
    assert.isTrue(isTheme("system"));
    assert.isTrue(isTheme("light"));
    assert.isTrue(isTheme("dark"));
    assert.isFalse(isTheme("blue"));
    assert.isFalse(isTheme(undefined));
    assert.isFalse(isTheme(1));
});

afterEach(() => {
    vi.useRealTimers();
});

test("disables transitions until the next frame while switching", () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame"] });
    const root = document.createElement("html");

    applyTheme("dark", root);
    assert.strictEqual(root.getAttribute("data-theme"), "dark");
    assert.isTrue(root.classList.contains("theme-switching"));

    vi.advanceTimersToNextFrame();
    assert.isFalse(root.classList.contains("theme-switching"));

    applyTheme("system", root);
    assert.isFalse(root.hasAttribute("data-theme"));
});
