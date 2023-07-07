# Mob timer

## Getting started

1. `npm install`
1. `npm run update`
    - For development in Windows, copy `./lib/WebView2Loader.dll` to `./bin/`.
    - For development in macOS in a version older than 12, update `binaryVersion` to `4.8.0` in [neutralino.config.json](./neutralino.config.json) and re-run `npm run update`. Don't commit this change.
1. Start the application in development mode: `npm start`

## Binaries

To create binaries locally, execute `npm run build`.

## Release

Pushing a tag to GitHub following the format `v*` (e.g. `v2.0.0`) will automatically publish a release.

Binaries for release are built on Windows to support adding Windows executable resources. This is done by running `npm run release`.

## Read more

-   [Neutralinojs docs](https://neutralino.js.org/docs/)
