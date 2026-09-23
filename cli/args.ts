import { parseArgs } from "node:util";
import { parseInterval } from "../lib/clock.ts";

export type CliOptions = {
    team?: string[];
    intervalSeconds?: number;
    breaks: boolean;
    shuffle: boolean;
    notify: boolean;
    show: boolean;
    help: boolean;
    version: boolean;
};

export const usage = `Usage: mobtimer [options]

Options:
  -t, --team <names>       Comma-separated team members, e.g. "Ann,Bo,Cy" (saved)
  -i, --interval <length>  Turn length, e.g. 10m, 90s, 7:30 or 600 (saved)
      --no-breaks          Don't take a break after each round
  -s, --shuffle            Shuffle the team order (saved)
      --no-notify          No bell or desktop notification when a turn ends
      --show               Print saved team and interval, then exit
  -h, --help               Show this help
  -v, --version            Show version

Keys while running:
  enter  start                      space  start / pause / resume
  n      next driver                1-9    make member driver
  a 1-9  toggle member away         b      skip / toggle breaks
  r 1-9  rename member              s      shuffle team
  + / -  interval +/- 1 minute      q      quit`;

export function parseCliArgs(args: string[]): CliOptions {
    const { values } = parseArgs({
        args,
        allowNegative: true,
        strict: true,
        options: {
            team: { type: "string", short: "t" },
            interval: { type: "string", short: "i" },
            breaks: { type: "boolean", default: true },
            shuffle: { type: "boolean", short: "s", default: false },
            notify: { type: "boolean", default: true },
            show: { type: "boolean", default: false },
            help: { type: "boolean", short: "h", default: false },
            version: { type: "boolean", short: "v", default: false },
        },
    });

    return {
        team: values.team === undefined ? undefined : parseTeam(values.team),
        intervalSeconds:
            values.interval === undefined
                ? undefined
                : parseIntervalOption(values.interval),
        breaks: values.breaks,
        shuffle: values.shuffle,
        notify: values.notify,
        show: values.show,
        help: values.help,
        version: values.version,
    };
}

function parseTeam(value: string) {
    const members = value
        .split(",")
        .map(name => name.trim())
        .filter(Boolean);

    if (members.length === 0)
        throw new Error('--team needs at least one name, e.g. "Ann,Bo"');

    return members;
}

function parseIntervalOption(value: string) {
    const seconds = parseInterval(value);

    if (seconds === undefined)
        throw new Error(
            `Invalid --interval "${value}", use e.g. 10m, 90s, 7:30 or 600`
        );

    return seconds;
}
