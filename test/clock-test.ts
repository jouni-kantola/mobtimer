import { assert, test } from "vitest";
import { type TimeRemaining, startTimer } from "../resources/scripts/clock";

test("determine if running", () => {
    const seconds = 1;
    const timer = startTimer(seconds, () => { }, () => { });
    assert.ok(timer.isRunning);
});

test("stopped when interval ends", async () => {
    const seconds = 1;
    const timer = startTimer(seconds, () => { }, () => { });

    assert.ok(timer.isRunning);
    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });
    assert.strictEqual(timer.isRunning, false);
});

test("callbacks every tick", async () => {
    const seconds = 3;
    let timesCalled = 0;

    await new Promise<void>((resolve, _) => {
        startTimer(seconds, () => {
            timesCalled++;
            if (timesCalled === 2) {
                resolve();
            }
        }, () => { });
    });
});

test("notify when countdown done", async () => {
    await new Promise<void>((resolve, _) => {
        return startTimer(1, () => { }, resolve);
    });
});

test("provide formatted time left", async () => {
    const seconds = 600;
    const timer = startTimer(seconds, () => { }, () => { });

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    assert.deepEqual(timer.timeLeft, [9, 59]);

    // without reseting test run never ends
    timer.reset();
});

test("can change timer", async () => {
    const timer = startTimer(600, () => { }, () => { });
    timer.change(300);
    assert.deepEqual(timer.timeLeft, [5, 0]);
    timer.change(1);
    assert.deepEqual(timer.timeLeft, [0, 1]);
});

test("can reset started timer", async () => {
    const timer = startTimer(600, () => { }, () => { });

    assert.ok(timer.isRunning);

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    timer.reset();

    assert.strictEqual(timer.isRunning, false);
    assert.deepEqual(timer.timeLeft, [10, 0]);
});

test("can pause timer", async () => {
    const timer = startTimer(600, () => { }, () => { });

    assert.ok(timer.isRunning);

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    timer.pause();
    assert.strictEqual(timer.isRunning, false);

    assert.deepEqual(timer.timeLeft, [9, 59]);
});

test("time remaining given on tick", async () => {
    const timeRemaining = await new Promise<TimeRemaining>((resolve, _) => {
        startTimer(600, (timeLeft) => {
            resolve(timeLeft);
        }, () => { });
    });

    assert.deepEqual(timeRemaining, [9, 59]);
});
