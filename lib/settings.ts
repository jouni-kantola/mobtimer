import { defaultIntervalSeconds, defaultMembers } from "./config.ts";

export type Settings = {
    members: string[];
    intervalSeconds: number;
};

export interface SettingsStore {
    // omits settings that are missing or unreadable
    load(): Promise<Partial<Settings>>;
    saveMembers(members: string[]): Promise<void>;
    saveInterval(seconds: number): Promise<void>;
}

export async function loadSettings(store: SettingsStore): Promise<Settings> {
    const stored = await store.load().catch(() => ({}) as Partial<Settings>);

    const members = isMembers(stored.members) ? stored.members : undefined;
    const intervalSeconds = isInterval(stored.intervalSeconds)
        ? stored.intervalSeconds
        : undefined;

    if (!members) await store.saveMembers(defaultMembers);
    if (!intervalSeconds) await store.saveInterval(defaultIntervalSeconds);

    return {
        members: members ?? [...defaultMembers],
        intervalSeconds: intervalSeconds ?? defaultIntervalSeconds,
    };
}

function isMembers(value: unknown): value is string[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(name => typeof name === "string")
    );
}

function isInterval(value: unknown): value is number {
    return typeof value === "number" && Number.isInteger(value) && value > 0;
}
