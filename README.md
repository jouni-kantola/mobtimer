# Mob timer

## Getting started

1. `npm install`
1. `npm run update`

## Development

1. For development in Windows, copy `./lib/WebView2Loader.dll` to `./bin/`.
1. Start the application in development mode: `npm start`

Note: In Windows, use `cmd.exe` to ensure `--window-enable-inspector` is passed along correctly.

## Binaries

To create binaries locally, execute `npm run build`.

## Release

Pushing a tag to GitHub following the format `v*` (e.g. `v2.0.0`) will automatically publish a release.

Binaries for release are built on Windows to support adding Windows executable resources. This is done by running `npm run release`.

## Read more

-   [Neutralinojs docs](https://neutralino.js.org/docs/)
