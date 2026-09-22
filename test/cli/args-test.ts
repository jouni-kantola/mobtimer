import { assert, test } from "vitest";
import { parseCliArgs } from "../../cli/args.ts";

test("defaults", () => {
    assert.deepEqual(parseCliArgs([]), {
        team: undefined,
        intervalSeconds: undefined,
        breaks: true,
        shuffle: false,
        notify: true,
        show: false,
        help: false,
        version: false,
    });
});

test("team and interval", () => {
    const options = parseCliArgs(["--team", " Ann, Bo ,,Cy ", "-i", "7m"]);

    assert.deepEqual(options.team, ["Ann", "Bo", "Cy"]);
    assert.strictEqual(options.intervalSeconds, 420);
});

test("negated flags", () => {
    const options = parseCliArgs(["--no-breaks", "--no-notify"]);

    assert.isFalse(options.breaks);
    assert.isFalse(options.notify);
});

test("short flags", () => {
    const options = parseCliArgs(["-t", "Ann", "-s", "-h", "-v"]);

    assert.deepEqual(options.team, ["Ann"]);
    assert.isTrue(options.shuffle);
    assert.isTrue(options.help);
    assert.isTrue(options.version);
});

test("invalid interval", () => {
    assert.throws(() => parseCliArgs(["--interval", "soon"]), /--interval/);
});

test("empty team", () => {
    assert.throws(() => parseCliArgs(["--team", " , "]), /--team/);
});

test("unknown option", () => {
    assert.throws(() => parseCliArgs(["--nope"]));
});
