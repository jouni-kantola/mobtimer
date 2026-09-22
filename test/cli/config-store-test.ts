import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, assert, beforeEach, test } from "vitest";
import { createFileStore, defaultConfigPath } from "../../cli/config-store.ts";

let dir: string;

beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "mobtimer-"));
});

afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
});

test("config lives in XDG config home, or ~/.config", () => {
    assert.strictEqual(
        defaultConfigPath({ XDG_CONFIG_HOME: "/xdg" }, "/home/me"),
        join("/xdg", "mobtimer", "config.json")
    );
    assert.strictEqual(
        defaultConfigPath({}, "/home/me"),
        join("/home/me", ".config", "mobtimer", "config.json")
    );
});

test("missing file loads as empty", async () => {
    const store = createFileStore(join(dir, "none", "config.json"));

    assert.deepEqual(await store.load(), {});
});

test("broken file loads as empty", async () => {
    const path = join(dir, "config.json");
    await writeFile(path, "{ not json");

    assert.deepEqual(await createFileStore(path).load(), {});
});

test("saves create the file and keep other settings", async () => {
    const path = join(dir, "nested", "config.json");
    const store = createFileStore(path);

    await store.saveMembers(["Ann", "Bo"]);
    await store.saveInterval(300);

    assert.deepEqual(await store.load(), {
        members: ["Ann", "Bo"],
        intervalSeconds: 300,
    });
    assert.deepEqual(JSON.parse(await readFile(path, "utf-8")), {
        members: ["Ann", "Bo"],
        intervalSeconds: 300,
    });
});
