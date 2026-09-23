import { afterEach, assert, beforeEach, test, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createTeam } from "../lib/team.ts";

vi.mock("../resources/scripts/neutralino-api", () => ({
    updateTray: vi.fn(async () => {}),
    saveTeam: vi.fn(async () => {}),
    saveIntervalLength: vi.fn(async () => {}),
    showWindow: vi.fn(async () => {}),
    hideWindow: vi.fn(async () => {}),
    saveTheme: vi.fn(async () => {}),
}));

import App from "../resources/scripts/App.vue";
import * as neutralino from "../resources/scripts/neutralino-api";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
});

function mountApp() {
    return mount(App, {
        props: {
            team: createTeam(["Ann", "Bo"]),
            intervalLengthInSeconds: 60,
        },
    });
}

const startButton = (wrapper: ReturnType<typeof mountApp>) =>
    wrapper.findAll("button").find(b => /Start|Pause|Resume/.test(b.text()))!;

test("start button starts, pauses and resumes", async () => {
    const wrapper = mountApp();
    assert.strictEqual(startButton(wrapper).text(), "Start session for Ann");

    await startButton(wrapper).trigger("click");
    assert.strictEqual(startButton(wrapper).text(), "Pause");
    assert.strictEqual(vi.mocked(neutralino.hideWindow).mock.calls.length, 1);

    await startButton(wrapper).trigger("click");
    assert.strictEqual(startButton(wrapper).text(), "Resume");

    await startButton(wrapper).trigger("click");
    assert.strictEqual(startButton(wrapper).text(), "Pause");
});

test("turn end shows next driver and window", async () => {
    const wrapper = mountApp();

    await startButton(wrapper).trigger("click");
    vi.advanceTimersByTime(60_000);
    await flushPromises();

    assert.strictEqual(startButton(wrapper).text(), "Start session for Bo");
    assert.isTrue(wrapper.findAll(".current input[type='text']").length === 1);
    assert.strictEqual(
        (
            wrapper.find(".current input[type='text']")
                .element as HTMLInputElement
        ).value,
        "Bo"
    );
    assert.strictEqual(vi.mocked(neutralino.showWindow).mock.calls.length, 1);
});

test("break alert shows after last driver", async () => {
    const wrapper = mountApp();
    await wrapper.findAll("input[type='text']").at(-1)!.trigger("dblclick");

    await startButton(wrapper).trigger("click");
    vi.advanceTimersByTime(60_000);
    await flushPromises();

    assert.isTrue(wrapper.find(".alert").exists());
    assert.deepEqual(vi.mocked(neutralino.updateTray).mock.lastCall![0], {
        now: "Break",
        next: "Ann",
        timeLeft: "01:00",
    });
});

test("tick updates the countdown", async () => {
    const wrapper = mountApp();

    await startButton(wrapper).trigger("click");
    vi.advanceTimersByTime(1000);
    await flushPromises();

    const [minutes, seconds] = wrapper
        .findAll(".timer input")
        .map(i => (i.element as HTMLInputElement).value);
    assert.deepEqual([minutes, seconds], ["00", "59"]);
});

test("theme toggle cycles system, light and dark", async () => {
    const wrapper = mountApp();
    const toggle = () => wrapper.find(".theme-toggle");
    const visibleLabel = () =>
        toggle().find(":scope > span:not(.hidden)").text();
    const root = document.documentElement;

    assert.include(visibleLabel(), "System");
    assert.isFalse(root.hasAttribute("data-theme"));

    await toggle().trigger("click");
    assert.include(visibleLabel(), "Light");
    assert.strictEqual(root.getAttribute("data-theme"), "light");
    assert.strictEqual(
        vi.mocked(neutralino.saveTheme).mock.lastCall![0],
        "light"
    );

    await toggle().trigger("click");
    assert.include(visibleLabel(), "Dark");
    assert.strictEqual(root.getAttribute("data-theme"), "dark");

    await toggle().trigger("click");
    assert.include(visibleLabel(), "System");
    assert.isFalse(root.hasAttribute("data-theme"));
    assert.strictEqual(
        vi.mocked(neutralino.saveTheme).mock.lastCall![0],
        "system"
    );
});
