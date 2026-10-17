# The World's Worst Emergency Service

A standalone, illustrated browser game by Jay Kapoor. A cat needs rescuing. Deploy a dinosaur. The dinosaur eats a house. Somehow, you get promoted.

## Play

Choose one of three responses to a call, operate the response directly in the town, and watch its consequences stick around. Failure advances the story too. Your decisions generate follow-up calls, grow the town's peculiar local traditions, and eventually get you elected President. The phone keeps ringing after that.

- 33 authored emergencies and 99 response branches.
- Five input-driven operations: steering, helicopter rescue, magnetic collection, three-stamp timing, and wind-affected delivery launches.
- Original procedural Canvas illustrations, moving citizens and traffic, and persistent visual combinations.
- Local saves, case history, mute, confirmation before New Game, keyboard controls, touch controls, and reduced ambient motion.
- Original synthesized ring, siren, stamp, crash, success, and promotion sounds. Audio starts after interaction.
- No accounts, backend, AI API, paid service, tracking, or external runtime network requests.

## Development

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the local address shown by Vite.

```sh
npm run check
npm run lint
npm test
npm run build
npm run portable
```

`npm run portable` builds a complete single-file game at `release/PLAY.html`, including fonts. Open that file in a desktop browser without a server. Saving on `file:` origins depends on browser support; the app reports when storage is unavailable. Serving the game over HTTP/HTTPS gives it a stable save origin. Moving between origins does not transfer saves.

## Architecture

| File               | Responsibility                                                                 |
| ------------------ | ------------------------------------------------------------------------------ |
| `src/events.ts`    | Authored calls, responses, causal follow-ups, tier and novelty selection       |
| `src/model.ts`     | World model, deterministic resolution, progression, schema validation          |
| `src/session.ts`   | Completed cases, promotion acknowledgement, next-call transitions              |
| `src/operation.ts` | Input, simulated movement, collisions, rescue drops, trajectories, quality     |
| `src/render.ts`    | Original town art, ambient animation, visible effects and operation rendering  |
| `src/World.tsx`    | Canvas lifecycle, responsive resolution, pointer/keyboard input, frame updates |
| `src/App.tsx`      | Dispatch UI, persistence, reports, case history, mute and New Game             |
| `src/audio.ts`     | Gesture-gated procedural audio                                                 |

React renders the interface; Canvas runs the simulation in one animation loop. UI operation readouts are throttled to ten updates per second. Simulation pauses in hidden tabs. The world freezes for promotions while confetti continues. Reduced motion stops ambient movement while preserving necessary challenge feedback.

Entity counts and retained data are bounded: 32 evidence marks, 100 decisions, seven recent event IDs, up to three visible dinosaurs and ten pigeons. Conditions combine: flooded dinosaurs swim, alien-era dinosaurs acquire diplomatic status, and the pigeon mayor occupies a magnetized vehicle pile.

Saves contain the last safe session state. An operation is transient: refreshing during it replays the same unanswered call. Completed cases and promotion screens are saved, so refreshing cannot apply a decision twice or skip a promotion. Corrupt saves fall back to a fresh town.

## Add an emergency

Add an `Emergency` to `events` with a unique ID, caller, short situation, town location, tier, and three responses. Each response specifies a mechanic, illustrated response tool, written consequence, world effects, and optional causal `next` ID. The automated suite validates all follow-up references. Optional `requires` restricts a call to a relevant world effect.

## Add a mechanic

Extend `Mechanic`, add its input/step/scoring logic to `Operation`, provide instructions in `HELP`, and render its operation in `drawOperation`. Return an `Outcome`; persistent consequences still go through the same `resolve` function. Test actual input quality and fail-forward resolution, not only rendering.

## Deployment

This project must remain separate from `kapoorjay.com` and StrayPaw.

- GitHub: `jaykapoor7/worst-emergency-service`
- Independent Vercel project: `worst-emergency-service`
- Intended custom domain: `emergency.kapoorjay.com`
- Framework: Vite; install: `npm ci`; build: `npm run build`; output: `dist`

Import this repository into its own Vercel project. Once the deployment is READY, open the production URL and exercise several operations, refresh persistence, mute, and New Game on desktop and a phone. Add only `emergency.kapoorjay.com` under that project's Domains. Use the exact DNS value Vercel returns for this subdomain; preserve all apex and existing portfolio/StrayPaw records. A configured domain is not verified until its DNS, certificate and HTTPS response work.

## Verification

See `VERIFICATION.md` for the precise checks completed and remaining limitations. A successful compile or engine test is not a browser end-to-end test.

## Assets

All town graphics and sound synthesis are original code. Bundled DM Sans, DM Mono and Fraunces font files are redistributed with their SIL Open Font License notices in `public/fonts/`. Third-party npm dependencies retain their own licenses. No reference-site artwork, music or game code is used.
