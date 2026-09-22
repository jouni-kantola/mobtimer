import { afterEach, assert, beforeEach, test, vi } from "vitest";
import { createSession } from "../../lib/session.ts";
import { createTeam, getActiveMember } from "../../lib/team.ts";
import { type Key, createKeyHandler, renderScreen } from "../../cli/tui.ts";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

function setup() {
    const session = createSession({
        team: createTeam(["Ann", "Bo", "Cy"]),
        intervalSeconds: 600,
    });
    const actions = {
        quit: vi.fn(),
        saveMembers: vi.fn(),
        saveInterval: vi.fn(),
        say: vi.fn(),
    };
    const handle = createKeyHandler(session, actions);
    const press = (...keys: Key[]) => keys.forEach(handle);
    const driver = () => getActiveMember(session.state.team).name;
    return { session, actions, press, driver };
}

const key = (sequence: string, name: string | undefined = sequence): Key => ({
    sequence,
    name,
});

test("screen shows time, status, now and next, and the team", () => {
    const { session } = setup();
    session.setMemberHere(2, false);

    const screen = renderScreen(session.state, session.labels()).join("\n");

    assert.include(screen, " 10:00 ");
    assert.include(screen, "Ready");
    assert.include(screen, "Now: Ann");
    assert.include(screen, "Next: Bo (in 10:00)");
    assert.include(screen, "1 ▶ Ann");
    assert.include(screen, "2   Bo");
    assert.include(screen, "3   Cy (away)");
    assert.include(screen, "q quit");
});

test("screen shows break and message", () => {
    const { session } = setup();
    session.setTakeBreaks(false);

    const screen = renderScreen(session.state, session.labels(), {
        message: "Hello",
    }).join("\n");

    assert.include(screen, "(no breaks)");
    assert.include(screen, "Hello");
    assert.notInclude(screen, "q quit");
});

test("space starts, pauses and resumes", () => {
    const { session, press } = setup();

    press(key(" ", "space"));
    assert.strictEqual(session.state.status, "running");
    press(key(" ", "space"));
    assert.strictEqual(session.state.status, "paused");
    press(key(" ", "space"));
    assert.strictEqual(session.state.status, "running");
});

test("enter starts but does not pause", () => {
    const { session, press } = setup();

    press(key("\r", "return"));
    assert.strictEqual(session.state.status, "running");
    press(key("\r", "return"));
    assert.strictEqual(session.state.status, "running");

    press(key(" ", "space"));
    press(key("\r", "return"));
    assert.strictEqual(session.state.status, "paused");
});

test("n moves to next driver", () => {
    const { press, driver } = setup();

    press(key("n"));

    assert.strictEqual(driver(), "Bo");
});

test("number picks driver", () => {
    const { press, driver } = setup();

    press(key("3"));

    assert.strictEqual(driver(), "Cy");
});

test("a then number toggles away", () => {
    const { session, press, actions } = setup();

    press(key("a"));
    assert.include(actions.say.mock.lastCall![0], "1-9");
    press(key("2"));
    assert.isFalse(session.state.team[1].isHere);

    press(key("a"), key("2"));
    assert.isTrue(session.state.team[1].isHere);
});

test("a then other key cancels", () => {
    const { session, press, driver } = setup();

    press(key("a"), key("x"), key("2"));

    assert.isTrue(session.state.team[1].isHere);
    assert.strictEqual(driver(), "Bo");
});

test("b skips break", () => {
    const { session, press, driver } = setup();
    press(key("3"), key(" ", "space"));
    vi.advanceTimersByTime(600_000);
    assert.isTrue(session.state.onBreak);

    press(key("b"));

    assert.isFalse(session.state.onBreak);
    assert.strictEqual(driver(), "Ann");
});

test("s shuffles and saves team", () => {
    const { session, press, actions } = setup();

    press(key("s"));

    assert.deepEqual(
        actions.saveMembers.mock.lastCall![0],
        session.state.team.map(m => m.name)
    );
    assert.notDeepEqual(
        session.state.team.map(m => m.name),
        ["Ann", "Bo", "Cy"]
    );
});

test("+ and - change interval by a minute and save it", () => {
    const { session, press, actions } = setup();

    press(key("+", undefined));
    assert.strictEqual(session.state.intervalSeconds, 660);
    press(key("-", undefined), key("-", undefined));
    assert.strictEqual(session.state.intervalSeconds, 540);
    assert.strictEqual(actions.saveInterval.mock.lastCall![0], 540);
});

test("interval does not go below a minute", () => {
    const { session, press } = setup();
    session.setInterval(60);

    press(key("-", undefined));

    assert.strictEqual(session.state.intervalSeconds, 60);
});

test("q and ctrl-c quit", () => {
    const { press, actions } = setup();

    press(key("q"));
    press({ name: "c", ctrl: true, sequence: "\x03" });

    assert.strictEqual(actions.quit.mock.calls.length, 2);
});
