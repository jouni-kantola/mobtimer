import { assert, test } from "vitest";
import { notificationCommand } from "../../cli/notify.ts";

test("macOS uses osascript with quotes escaped", () => {
    assert.deepEqual(
        notificationCommand("Mob timer", 'Jo "JJ"\'s turn', "darwin"),
        [
            "osascript",
            "-e",
            'display notification "Jo \\"JJ\\"\'s turn" with title "Mob timer"',
        ]
    );
});

test("linux uses notify-send", () => {
    assert.deepEqual(notificationCommand("Mob timer", "Bo's turn", "linux"), [
        "notify-send",
        "Mob timer",
        "Bo's turn",
    ]);
});

test("no desktop notification elsewhere", () => {
    assert.isUndefined(notificationCommand("Mob timer", "Bo's turn", "win32"));
});
