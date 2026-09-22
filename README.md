# Mob timer

![318569467-e07369a8-0239-42e2-80bb-7aa376a79c19](https://github.com/jouni-kantola/mobtimer/assets/2670127/e2c242c1-b4af-4c70-8c03-5c0dfa031e2a)

## Getting started

1. `npm install`
1. `npm run update`
1. Start the application in development mode: `npm start`

## CLI

A terminal mob timer that shares its timer and rotation logic (`lib/`) with the app. It needs Node.js 24.

```sh
npm install
npm link            # adds a `mobtimer` command
mobtimer --team "Ann,Bo,Cy" --interval 10m
```

Or run it without linking: `npm run cli -- --help`.

Team and interval are saved to `~/.config/mobtimer/config.json` (or `$XDG_CONFIG_HOME/mobtimer/config.json`), so after the first run `mobtimer` is enough. Without saved settings it starts with the same defaults as the app: six members and 10 minute turns, with breaks.

| Key          | Action                             |
| ------------ | ---------------------------------- |
| `space`      | Start, pause or resume             |
| `n`          | Next driver                        |
| `1`–`9`      | Make member driver                 |
| `a`, `1`–`9` | Toggle member away                 |
| `b`          | Skip break                         |
| `s`          | Shuffle team                       |
| `+` / `-`    | Interval one minute longer/shorter |
| `q`          | Quit                               |

When a turn ends the terminal bell rings and a desktop notification is shown (turn off with `--no-notify`). `--no-breaks` skips the break after each round. See `mobtimer --help` for all options.

## Binaries

To create binaries locally, execute `npm run build`.

## Release

Pushing a tag to GitHub following the format `v*` (e.g. `v2.0.0`) will automatically publish a release.

Binaries for release are built on Windows to support adding Windows executable resources. This is done by running `npm run release`.

## Read more

- [Neutralinojs docs](https://neutralino.js.org/docs/)
