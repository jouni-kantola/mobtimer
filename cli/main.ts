import { readFile } from "node:fs/promises";
import { formatTime, secondsToMinutesAndSeconds } from "../lib/clock.ts";
import { loadSettings } from "../lib/settings.ts";
import { createTeam, shuffleTeam } from "../lib/team.ts";
import { type CliOptions, parseCliArgs, usage } from "./args.ts";
import { createFileStore, defaultConfigPath } from "./config-store.ts";

export async function main(args: string[]) {
    let options: CliOptions;
    try {
        options = parseCliArgs(args);
    } catch (err) {
        console.error(`mobtimer: ${(err as Error).message}\n\n${usage}`);
        return 2;
    }

    if (options.help) {
        console.log(usage);
        return 0;
    }

    if (options.version) {
        console.log(await readVersion());
        return 0;
    }

    const store = createFileStore();
    const settings = await loadSettings(store);

    if (options.team) {
        settings.members = options.team;
        await store.saveMembers(settings.members);
    }

    if (options.shuffle) {
        const team = createTeam(settings.members);
        shuffleTeam(team);
        settings.members = team.map(m => m.name);
        await store.saveMembers(settings.members);
    }

    if (options.intervalSeconds) {
        settings.intervalSeconds = options.intervalSeconds;
        await store.saveInterval(settings.intervalSeconds);
    }

    if (options.show) {
        console.log(`Team:     ${settings.members.join(", ")}`);
        console.log(
            `Interval: ${formatTime(secondsToMinutesAndSeconds(settings.intervalSeconds))}`
        );
        console.log(`Config:   ${defaultConfigPath()}`);
        return 0;
    }

    console.error("mobtimer: interactive timer not implemented yet");
    return 1;
}

async function readVersion() {
    const pkg = JSON.parse(
        await readFile(new URL("../package.json", import.meta.url), "utf-8")
    );
    return pkg.version as string;
}
