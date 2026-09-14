# Inserting Lollipop Game Template

A remixable Vincentt XR candy game built with React, React Three Fiber, and the Vincentt XR SDK. Show a peace sign to launch lollipops into the rotating candy wheel. Reach the target score before time runs out, then show a fist to reset.

## Run locally

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Controls and game flow

- Idle: show a peace sign to start.
- Running: each peace-sign detection launches the active lollipop.
- Success: the lollipop sticks to the wheel and the score increases.
- Collision or timeout: the round ends.
- End screen: show a closed fist to reset the round.

The game uses the `victory` and `closed_fist` gesture names from the SDK. Gesture arm delays prevent a gesture held during a state transition from firing twice.

## Remix guide

Start with [`src/lollipop/gameConfig.ts`](./src/lollipop/gameConfig.ts):

- `durationSeconds`: round length.
- `targetScore`: successful insertions needed to win.
- `gesture`: start/shoot and reset gesture names.
- `animation`: roulette, spiral, launch, snap, and feedback timing.
- `hud.timerUrgencySeconds`: when the timer becomes urgent.

Customize authored scene placement in [`src/lollipop/settings.ts`](./src/lollipop/settings.ts): layer positions, sizes, rotations, render order, image settings, and collision hitboxes.

For presentation changes, edit `src/lollipop/LollipopLayer.tsx`:

- `LollipopImageLayer` adapts authored 2D image layers to the SDK.
- `CandyHud` owns score, progress, timer, instruction, feedback, and end-screen HTML styling and animations.
- Do not reintroduce SDK `ScreenText`; the runtime HUD is plain HTML rendered through drei's `Html` bridge.

Replace artwork and sounds in `public/images/` and `public/audios/`. Keep paths in `settings.ts` and `LollipopGame.tsx` synchronized when renaming files.

## Project structure

```text
src/
  App.tsx                 protected XR shell
  Scene.tsx               camera background and game composition
  gesture.ts              reusable gesture-hold helper
  overlay.tsx             generic HTML overlay primitives
  lollipop/
    gameConfig.ts         primary remix configuration
    LollipopGame.tsx      state, gestures, collisions, scoring, timing
    LollipopLayer.tsx     image adapter and Candy HUD
    settings.ts           authored 720x1280 scene layout
public/
  images/                 candy artwork
  audios/                 game sounds
```

`App.tsx`, `main.tsx`, and the preview shell are runtime infrastructure. Remix game behavior in `lollipop/` and replace assets in `public/`.

## Validation checklist

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Manually verify the idle instruction, peace-sign launch, score/progress updates, urgent timer, collision/end screen, and fist reset on the portrait preview.
