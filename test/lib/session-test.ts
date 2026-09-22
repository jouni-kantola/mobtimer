import { afterEach, assert, beforeEach, test, vi } from "vitest";
import { createSession } from "../../lib/session.ts";
import { createTeam, getActiveMember } from "../../lib/team.ts";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

function setup(members = ["Ann", "Bo", "Cy"], takeBreaks = true) {
    const onChange = vi.fn();
    const onTurnEnd = vi.fn();
    const session = createSession(
        { team: createTeam(members), intervalSeconds: 60, takeBreaks },
        { onChange, onTurnEnd }
    );
    const driver = () => getActiveMember(session.state.team).name;
    return { session, driver, onChange, onTurnEnd };
}

test("starts idle with the first member driving", () => {
    const { session, driver } = setup();

    assert.strictEqual(session.state.status, "idle");
    assert.deepEqual(session.state.timeRemaining, [1, 0]);
    assert.strictEqual(driver(), "Ann");
});

test("counts down once started", () => {
    const { session, onChange } = setup();

    assert.isTrue(session.start());
    vi.advanceTimersByTime(1000);

    assert.strictEqual(session.state.status, "running");
    assert.deepEqual(session.state.timeRemaining, [0, 59]);
    assert.deepEqual(onChange.mock.lastCall![0].timeRemaining, [0, 59]);
});

test("next driver is up when turn ends", () => {
    const { session, driver, onTurnEnd } = setup();

    session.start();
    vi.advanceTimersByTime(60_000);

    assert.strictEqual(driver(), "Bo");
    assert.strictEqual(session.state.status, "idle");
    assert.deepEqual(session.state.timeRemaining, [1, 0]);
    assert.strictEqual(onTurnEnd.mock.calls.length, 1);
});

test("break starts after last member's turn", () => {
    const { session, driver, onTurnEnd } = setup(["Ann", "Bo"]);

    session.switchDriver(1);
    session.start();
    vi.advanceTimersByTime(60_000);

    assert.isTrue(session.state.onBreak);
    assert.strictEqual(session.state.status, "running");
    assert.strictEqual(driver(), "Bo");
    assert.strictEqual(session.labels().now, "Break");
    assert.strictEqual(onTurnEnd.mock.calls.length, 1);

    vi.advanceTimersByTime(60_000);

    assert.isFalse(session.state.onBreak);
    assert.strictEqual(session.state.status, "idle");
    assert.strictEqual(driver(), "Ann");
    assert.strictEqual(onTurnEnd.mock.calls.length, 2);
});

test("no break when breaks are off", () => {
    const { session, driver } = setup(["Ann", "Bo"], false);

    session.switchDriver(1);
    session.start();
    vi.advanceTimersByTime(60_000);

    assert.isFalse(session.state.onBreak);
    assert.strictEqual(driver(), "Ann");
});

test("break can be skipped", () => {
    const { session, driver } = setup(["Ann", "Bo"]);
    session.switchDriver(1);
    session.start();
    vi.advanceTimersByTime(60_000);

    session.endBreak();

    assert.isFalse(session.state.onBreak);
    assert.strictEqual(session.state.status, "idle");
    assert.strictEqual(driver(), "Ann");
});

test("pause and resume keep time left", () => {
    const { session } = setup();
    session.start();
    vi.advanceTimersByTime(10_000);

    session.togglePause();
    vi.advanceTimersByTime(30_000);

    assert.strictEqual(session.state.status, "paused");
    assert.deepEqual(session.state.timeRemaining, [0, 50]);

    session.togglePause();
    vi.advanceTimersByTime(1000);

    assert.strictEqual(session.state.status, "running");
    assert.deepEqual(session.state.timeRemaining, [0, 49]);
});

test("toggle starts, pauses and resumes", () => {
    const { session } = setup();

    assert.isTrue(session.toggle());
    assert.strictEqual(session.state.status, "running");
    assert.isFalse(session.toggle());
    assert.strictEqual(session.state.status, "paused");
    assert.isFalse(session.toggle());
    assert.strictEqual(session.state.status, "running");
});

test("start does nothing while running or paused", () => {
    const { session } = setup();
    session.start();
    assert.isFalse(session.start());

    session.togglePause();
    assert.isFalse(session.start());
    assert.strictEqual(session.state.status, "paused");
});

test("switching driver stops the turn", () => {
    const { session, driver } = setup();
    session.start();
    vi.advanceTimersByTime(10_000);

    session.switchDriver(2);

    assert.strictEqual(driver(), "Cy");
    assert.strictEqual(session.state.status, "idle");
    assert.deepEqual(session.state.timeRemaining, [1, 0]);
});

test("away member cannot drive", () => {
    const { session, driver } = setup();
    session.setMemberHere(2, false);

    session.switchDriver(2);

    assert.strictEqual(driver(), "Ann");
});

test("marking the driver away hands over to next member here", () => {
    const { session, driver } = setup();
    session.setMemberHere(1, false);

    session.setMemberHere(0, false);

    assert.strictEqual(driver(), "Cy");
    assert.deepEqual(session.state.timeRemaining, [1, 0]);
});

test("last member here cannot be marked away", () => {
    const { session } = setup(["Ann", "Bo"]);
    session.setMemberHere(1, false);

    session.setMemberHere(0, false);

    assert.isTrue(session.state.team[0].isHere);
});

// documents current behavior: the GUI's start button stops responding
test("toggle does nothing after running driver is marked away", () => {
    const { session, driver } = setup();
    session.start();

    session.setMemberHere(0, false);
    session.toggle();

    assert.strictEqual(driver(), "Bo");
    assert.strictEqual(session.state.status, "idle");
});

test("changing interval restarts countdown", () => {
    const { session } = setup();
    session.start();
    vi.advanceTimersByTime(10_000);

    session.setInterval(120);
    vi.advanceTimersByTime(1000);

    assert.strictEqual(session.state.intervalSeconds, 120);
    assert.deepEqual(session.state.timeRemaining, [1, 59]);
});

test("rename, resize and shuffle change the team in place", () => {
    const { session, onChange } = setup();
    const team = session.state.team;

    session.renameMember(0, "Anna");
    session.setTeamSize(4);
    session.shuffle();

    assert.strictEqual(session.state.team, team);
    assert.strictEqual(team.length, 4);
    assert.include(
        team.map(m => m.name),
        "Anna"
    );
    assert.strictEqual(onChange.mock.calls.length, 3);
});

test("labels show the break coming up", () => {
    const { session } = setup(["Ann", "Bo"]);
    session.switchDriver(1);

    assert.strictEqual(session.labels().next, "Break");

    session.setTakeBreaks(false);

    assert.strictEqual(session.labels().next, "Ann");
});
