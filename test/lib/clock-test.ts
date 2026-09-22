import { afterEach, assert, beforeEach, test, vi } from "vitest";
import { type TimeRemaining, startTimer } from "../../lib/clock.ts";

const noop = () => {};

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

test("determine if running", () => {
    const timer = startTimer(1, noop, noop);
    assert.ok(timer.isRunning);
});

test("stopped when interval ends", () => {
    const timer = startTimer(1, noop, noop);

    assert.ok(timer.isRunning);
    vi.advanceTimersByTime(1500);
    assert.strictEqual(timer.isRunning, false);
});

test("callbacks every tick", () => {
    let timesCalled = 0;
    startTimer(3, () => timesCalled++, noop);

    vi.advanceTimersByTime(2000);

    assert.strictEqual(timesCalled, 2);
});

test("notify when countdown done", () => {
    const onEnd = vi.fn();
    startTimer(1, noop, onEnd);

    vi.advanceTimersByTime(1000);

    assert.strictEqual(onEnd.mock.calls.length, 1);
});

test("provide formatted time left", () => {
    const timer = startTimer(600, noop, noop);

    vi.advanceTimersByTime(1500);

    assert.deepEqual(timer.timeLeft, [9, 59]);
});

test("can change timer", () => {
    const timer = startTimer(600, noop, noop);
    timer.change(300);
    assert.deepEqual(timer.timeLeft, [5, 0]);
    timer.change(1);
    assert.deepEqual(timer.timeLeft, [0, 1]);
});

test("can reset started timer", () => {
    const timer = startTimer(600, noop, noop);

    assert.ok(timer.isRunning);
    vi.advanceTimersByTime(1500);

    timer.reset();

    assert.strictEqual(timer.isRunning, false);
    assert.deepEqual(timer.timeLeft, [10, 0]);
});

test("can pause timer", () => {
    const timer = startTimer(600, noop, noop);

    assert.ok(timer.isRunning);
    vi.advanceTimersByTime(1500);

    timer.pause();
    assert.strictEqual(timer.isRunning, false);
    assert.deepEqual(timer.timeLeft, [9, 59]);
});

test("time remaining given on tick", () => {
    let timeRemaining: TimeRemaining | undefined;
    startTimer(600, timeLeft => (timeRemaining = timeLeft), noop);

    vi.advanceTimersByTime(1000);

    assert.deepEqual(timeRemaining, [9, 59]);
});

test("starting a running timer has no effect", () => {
    const timer = startTimer(600, noop, noop);
    timer.start();

    vi.advanceTimersByTime(1000);

    assert.deepEqual(timer.timeLeft, [9, 59]);
});
