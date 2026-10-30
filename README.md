# Plus+ Sandbox

Sandbox for Plus+

## Setup

Requires Node.js `>=24.21.0` and pnpm `12.14.0` (pinned through `packageManager` and `devEngines`; other versions and package managers are rejected).

```sh
pnpm install
```

Installing bundles the [Video.js 10](https://videojs.org) player (with its hls.js media element) and copies Skeleton into `src/vendor/`. Run `pnpm build` to regenerate them manually.

## Usage

```sh
pnpm start:client   # serves the player at http://localhost:8080
pnpm start:server   # stream proxy at http://localhost:3001/stream
```
