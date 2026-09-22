import { assert, test } from "vitest";
import {
    isBreakNext,
    nextLine,
    nowLine,
    statusLabels,
} from "../../lib/status.ts";
import { createTeam, switchActiveMember } from "../../lib/team.ts";

const status = (overrides = {}) => ({
    team: createTeam(["Ann", "Bo", "Cy"]),
    onBreak: false,
    takeBreaks: true,
    timeRemaining: [9, 5] as [number, number],
    ...overrides,
});

test("labels show driver, next driver and time left", () => {
    assert.deepEqual(statusLabels(status()), {
        now: "Ann",
        next: "Bo",
        timeLeft: "09:05",
    });
});

test("break is next after last member here", () => {
    const s = status();
    switchActiveMember(2, s.team);

    assert.isTrue(isBreakNext(s));
    assert.strictEqual(statusLabels(s).next, "Break");
});

test("last member here counts when others at the end are away", () => {
    const s = status();
    s.team[2].isHere = false;
    switchActiveMember(1, s.team);

    assert.isTrue(isBreakNext(s));
});

test("no break next when breaks are off", () => {
    const s = status({ takeBreaks: false });
    switchActiveMember(2, s.team);

    assert.isFalse(isBreakNext(s));
    assert.strictEqual(statusLabels(s).next, "Ann");
});

test("during break now is break and next is not another break", () => {
    const s = status({ onBreak: true });
    switchActiveMember(2, s.team);

    const labels = statusLabels(s);
    assert.strictEqual(labels.now, "Break");
    assert.strictEqual(labels.next, "Ann");
});

test("status lines", () => {
    const labels = { now: "Ann", next: "Bo", timeLeft: "09:05" };
    assert.strictEqual(nowLine(labels), "Now: Ann");
    assert.strictEqual(nextLine(labels), "Next: Bo (in 09:05)");
});
