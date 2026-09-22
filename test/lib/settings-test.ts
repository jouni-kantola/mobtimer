import { assert, test } from "vitest";
import { defaultIntervalSeconds, defaultMembers } from "../../lib/config.ts";
import {
    type Settings,
    type SettingsStore,
    loadSettings,
} from "../../lib/settings.ts";

function memoryStore(initial: Partial<Settings>, failLoad = false) {
    const saved: Partial<Settings> = {};
    const store: SettingsStore = {
        load: async () => {
            if (failLoad) throw new Error("storage unavailable");
            return initial;
        },
        saveMembers: async members => {
            saved.members = members;
        },
        saveInterval: async seconds => {
            saved.intervalSeconds = seconds;
        },
    };
    return { store, saved };
}

test("load stored settings", async () => {
    const { store, saved } = memoryStore({
        members: ["Ann", "Bo"],
        intervalSeconds: 300,
    });

    const settings = await loadSettings(store);

    assert.deepEqual(settings, {
        members: ["Ann", "Bo"],
        intervalSeconds: 300,
    });
    assert.deepEqual(saved, {});
});

test("defaults are used and saved when nothing is stored", async () => {
    const { store, saved } = memoryStore({});

    const settings = await loadSettings(store);

    assert.deepEqual(settings, {
        members: defaultMembers,
        intervalSeconds: defaultIntervalSeconds,
    });
    assert.deepEqual(saved, {
        members: defaultMembers,
        intervalSeconds: defaultIntervalSeconds,
    });
});

test("defaults are used when storage fails", async () => {
    const { store } = memoryStore({}, true);

    const settings = await loadSettings(store);

    assert.deepEqual(settings.members, defaultMembers);
    assert.strictEqual(settings.intervalSeconds, defaultIntervalSeconds);
});

test("stored team is kept when interval is missing", async () => {
    const { store, saved } = memoryStore({ members: ["Ann", "Bo"] });

    const settings = await loadSettings(store);

    assert.deepEqual(settings.members, ["Ann", "Bo"]);
    assert.strictEqual(settings.intervalSeconds, defaultIntervalSeconds);
    assert.deepEqual(saved, { intervalSeconds: defaultIntervalSeconds });
});

test("invalid stored values are replaced with defaults", async () => {
    const { store } = memoryStore({
        members: [] as string[],
        intervalSeconds: -1,
    });

    const settings = await loadSettings(store);

    assert.deepEqual(settings.members, defaultMembers);
    assert.strictEqual(settings.intervalSeconds, defaultIntervalSeconds);
});

test("default members are not shared with loaded settings", async () => {
    const { store } = memoryStore({});

    const settings = await loadSettings(store);
    settings.members.push("Extra");

    assert.notInclude(defaultMembers, "Extra");
});
