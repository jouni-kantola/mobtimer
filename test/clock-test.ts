import { assert, test } from "vitest";
import { startTimer } from "../resources/js/clock";

test("determine if running", t => {
    const seconds = 1;
    const timer = startTimer(seconds, () => {}, () => {});
    assert.ok(timer.isRunning);
});

test("stopped when interval ends", async t => {
    const seconds = 1;
    const timer = startTimer(seconds, () => {}, () => {});

    assert.ok(timer.isRunning);
    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });
    assert.strictEqual(timer.isRunning, false);
});

test("callbacks every tick", async t => {
    const seconds = 3;
    let timesCalled = 0;

    await new Promise<void>((resolve, _) => {
        startTimer(seconds, () => {
            timesCalled++;
            if (timesCalled === 2) {
                resolve();
            }
        }, () => {});
    });
});

test("notify when countdown done", async t => {
    await new Promise<void>((resolve, _) => {
        return startTimer(1, () => {}, resolve);
    });
});

test("provide formatted time left", async t => {
    const seconds = 600;
    const timer = startTimer(seconds, () => {}, () => {});

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    assert.strictEqual(timer.timeLeft, "09:59");

    // without reseting test run never ends
    timer.reset();
});

test("can change timer", async t => {
    const timer = startTimer(600, () => {}, () => {});
    timer.change(300);
    assert.strictEqual(timer.timeLeft, "05:00");
    timer.change(1);
    assert.strictEqual(timer.timeLeft, "00:01");
});

test("can reset started timer", async t => {
    const timer = startTimer(600, () => {}, () => {});

    assert.ok(timer.isRunning);

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    timer.reset();

    assert.strictEqual(timer.isRunning, false);
    assert.strictEqual(timer.timeLeft, "10:00");
});

test("can pause timer", async t => {
    const timer = startTimer(600, () => {}, () => {});

    assert.ok(timer.isRunning);

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    timer.pause();
    assert.strictEqual(timer.isRunning, false);

    assert.strictEqual(timer.timeLeft, "09:59");
});
