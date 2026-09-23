# Mob Timer CLI

A mob programming timer for the terminal. It keeps track of whose turn it is, rotates drivers and takes a break after each round.

## Install

Needs Node.js 24 or later.

```sh
npx mobtimer --team "Ann,Bo,Cy" --interval 10m
```

Or install it globally:

```sh
npm install --global mobtimer
mobtimer --team "Ann,Bo,Cy" --interval 10m
```

Team and interval are saved to `~/.config/mobtimer/config.json` (or `$XDG_CONFIG_HOME/mobtimer/config.json`), so after the first run `mobtimer` is enough. Without saved settings it starts with six members and 10 minute turns, with breaks.

## Options

| Option                    | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `-t`, `--team <names>`    | Comma-separated team members, e.g. `"Ann,Bo,Cy"` (saved) |
| `-i`, `--interval <time>` | Turn length, e.g. `10m`, `90s`, `7:30` or `600` (saved)  |
| `--no-breaks`             | Don't take a break after each round                      |
| `-s`, `--shuffle`         | Shuffle the team order (saved)                           |
| `--no-notify`             | No bell or desktop notification when a turn ends         |
| `--show`                  | Print saved team and interval, then exit                 |
| `-h`, `--help`            | Show help                                                |
| `-v`, `--version`         | Show version                                             |

## Keys

| Key       | Action                                |
| --------- | ------------------------------------- |
| `enter`   | Start, or make selected member driver |
| `space`   | Start, pause or resume                |
| `n`       | Next driver                           |
| `↑` / `↓` | Select member                         |
| `1`–`9`   | Make member driver (back if away)     |
| `a`       | Mark selected member away or back     |
| `r`       | Rename selected member                |
| `b`       | Skip break, or toggle breaks          |
| `s`       | Shuffle team                          |
| `>` / `<` | Add or remove member                  |
| `+` / `-` | Interval one minute longer or shorter |
| `q`       | Quit                                  |

When a turn ends the terminal bell rings and a desktop notification is shown.

## Development

The CLI lives in the [mobtimer](https://github.com/jouni-kantola/mobtimer) repo next to the desktop app, and shares its timer and rotation logic (`lib/`). From the repo root:

```sh
npm install
npm run cli -- --help   # run from TypeScript source
npm link -w cli         # add a `mobtimer` command that runs the source
npm test
```

Node doesn't strip TypeScript types for packages in `node_modules`, so the published package is a single bundled JS file:

```sh
npm run build -w cli          # bundles cli/ and lib/ into cli/dist/mobtimer.js
npm pack -w cli --dry-run     # check what gets published
npm publish -w cli            # builds first via prepublishOnly
```
