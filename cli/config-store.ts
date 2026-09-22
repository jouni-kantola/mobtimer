import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Settings, SettingsStore } from "../lib/settings.ts";

export function defaultConfigPath(
    env: NodeJS.ProcessEnv = process.env,
    home = homedir()
) {
    const configHome = env.XDG_CONFIG_HOME || join(home, ".config");
    return join(configHome, "mobtimer", "config.json");
}

export function createFileStore(path = defaultConfigPath()): SettingsStore {
    async function read(): Promise<Partial<Settings>> {
        try {
            return JSON.parse(await readFile(path, "utf-8"));
        } catch {
            return {};
        }
    }

    async function update(settings: Partial<Settings>) {
        const current = await read();
        await mkdir(dirname(path), { recursive: true });
        await writeFile(
            path,
            JSON.stringify({ ...current, ...settings }, null, 4) + "\n"
        );
    }

    return {
        load: read,
        saveMembers: members => update({ members }),
        saveInterval: intervalSeconds => update({ intervalSeconds }),
    };
}
