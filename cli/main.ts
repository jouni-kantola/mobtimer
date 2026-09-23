import { formatTime, secondsToMinutesAndSeconds } from "../lib/clock.ts";
import { loadSettings } from "../lib/settings.ts";
import { createTeam, shuffleTeam } from "../lib/team.ts";
import { type CliOptions, parseCliArgs, usage } from "./args.ts";
import { createFileStore, defaultConfigPath } from "./config-store.ts";
import { createNotifier } from "./notify.ts";
import { runTui } from "./tui.ts";
import pkg from "./package.json" with { type: "json" };

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
        console.log(pkg.version);
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

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        console.error("mobtimer: needs an interactive terminal");
        return 1;
    }

    await runTui({
        team: createTeam(settings.members),
        intervalSeconds: settings.intervalSeconds,
        takeBreaks: options.breaks,
        notify: options.notify
            ? createNotifier(text => process.stdout.write(text))
            : undefined,
        saveMembers: members => void store.saveMembers(members),
        saveInterval: seconds => void store.saveInterval(seconds),
    });
    return 0;
}
