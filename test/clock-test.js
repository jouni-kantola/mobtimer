import test from "ava";
import { startTimer } from "../resources/js/clock.js";

test("determine if running", t => {
    const seconds = 1;
    const timer = startTimer(seconds);
    t.true(timer.isRunning);
});

test("stopped when interval ends", async t => {
    const seconds = 1;
    const timer = startTimer(seconds);

    t.true(timer.isRunning);
    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });
    t.false(timer.isRunning);
});

test("callbacks every tick", async t => {
    const seconds = 3;
    let timesCalled = 0;

    await new Promise((resolve, _) => {
        startTimer(seconds, () => {
            timesCalled++;
            if (timesCalled === 2) {
                t.pass();
                resolve();
            }
        });
    });
});

test("notify when countdown done", async t => {
    await new Promise((resolve, _) => {
        startTimer(1, undefined, resolve);
    });

    t.pass();
});
test("provide formatted time left", async t => {
    const seconds = 600;
    const timer = startTimer(seconds);

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    t.is("09:59", timer.timeLeft);
});

test("can change timer", async t => {
    const timer = startTimer(600);
    timer.change(300);
    t.is("05:00", timer.timeLeft);
    timer.change(1);
    t.is("00:01", timer.timeLeft);
});

test("can reset started timer", async t => {
    const timer = startTimer(600);

    t.true(timer.isRunning);

    await new Promise((resolve, _) => {
        setTimeout(resolve, 1500);
    });

    timer.reset();

    t.false(timer.isRunning);
    t.is("10:00", timer.timeLeft);
});
