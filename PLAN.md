# Inserting Lollipop Game Handoff

## Runtime

The scene runs a 20-second lollipop insertion round. `victory` starts the round
from idle and launches the active lollipop. Successful insertions attach a
lollipop to the rotating wheel and increase the score. A collision or timeout
ends the round. `closed_fist` is enabled only on the end screen and resets it.

## Source of truth

- `src/lollipop/gameConfig.ts`: remixable duration, target score, gesture names,
  gameplay speeds, feedback timing, and timer urgency threshold.
- `src/lollipop/settings.ts`: authored 720x1280 image positions, sizes,
  rotations, render order, assets, and collision hitboxes.
- `src/lollipop/LollipopGame.tsx`: state machine, gesture wiring, timing,
  collision math, score, audio, feedback events, and animation state.
- `src/lollipop/LollipopLayer.tsx`: SDK image adapter and HTML Candy HUD.

## UI behavior

- Idle shows a floating peace-sign instruction.
- Running shows score, progress, timer, and short hit feedback.
- Score pops after a successful insertion.
- The progress bar animates toward the target score.
- The timer pulses and changes color at the configured urgency threshold.
- The end card shows result, score, progress, and fist-reset instructions.

HUD is plain HTML through drei `<Html>`. Do not move HUD copy back into SDK
`ScreenText`: the game uses authored canvas coordinates for images and viewport
CSS coordinates for the HUD by design.

## Remix points

1. Change round difficulty and animation feel in `gameConfig.ts`.
2. Change object placement and collision regions in `settings.ts`.
3. Change HUD colors, layout, typography, and CSS animations in
   `LollipopLayer.tsx` and `src/index.css`.
4. Replace candy artwork in `public/images/`.
5. Replace hit/failure/victory sounds in `public/audios/`.
6. Change scoring or collision behavior only in `LollipopGame.tsx`.

## Assets and defaults

The authored scene uses a 720x1280 canvas. Keep image positions in those canvas
pixels; do not normalize them before passing them to `ScreenImage`. Hidden target
and hitbox layers are gameplay data even though they are not visible.

## Validation

Run `pnpm typecheck`, `pnpm lint`, and `pnpm build`. Then verify idle instruction,
peace-sign launch, progress, timer urgency, collision/end state, HTML HUD layout,
and fist reset in the portrait preview.
