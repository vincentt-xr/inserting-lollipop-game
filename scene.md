# Game02_lollipopGame.scene Map

Source: `.temp/EH_scenes/Game02_lollipopGame.scene`

This document records the Effect House to Vincentt transfer for the lollipop
insertion game. The final implementation uses SDK canvas-space screen objects
instead of the first-pass normalized conversion.

## Entities

- `Camera`
- `Special effects`
- `Prospect`
- `Roulette`
- `Lollipop_1` repeated hidden lollipop templates
- `Empty object`
- `Lollipop`
- `Count`
- `Click`
- `Music`
- `Challenge results`
- `Lollipop Border`
- `Tips`
- `Left branch`
- `Background`
- `Spiral`
- `Failure`
- `Failed sound effect`
- `Victory`
- `Victory sound effects`

## Assets

| EH object | EH texture/audio | Vincentt |
| --- | --- | --- |
| `Roulette` | `509959f9-...png` | `/images/Disk.png` |
| `Spiral` | `4222e25d-...png` | `/images/Spiral.png` |
| `Lollipop`, `Lollipop_1` | `7afe8f6c-...png` | `/images/Pink lollipop.png` |
| `Lollipop Border` | `f8b0430a-...png` | `/images/Bottom frame.png` |
| `Left branch` | `239737c1-...png` | `/images/Candy Drops.png` |
| `Click` | `audio/efe48e79-...mp3` | `/audios/Knocking the wood.mp3` |
| `Failure` | `audio/77352977-...mp3` | `/audios/Error sound effects.mp3` |
| `Victory` | `audio/85f91ea7-...mp3` | `/audios/Victory 2.mp3` |

Additional local lollipop variants exist in `public/images/`, but the current
runtime uses the pink lollipop.

## EH ScreenTransform Values

Effect House source canvas is `720 x 1280`.

Early transfer notes used normalized conversion:

- position: `{ x: anchoredPosition.x / 360, y: anchoredPosition.y / 640 }`
- size: `{ width: sizeDelta.x / 360, height: sizeDelta.y / 640 }`

Final implementation no longer pre-normalizes. It keeps Effect House-style
canvas values and passes `coordinateSpace: "canvas"` with
`canvasSize: { width: 720, height: 1280 }`.

| Object | localId | anchoredPosition | sizeDelta | visible in EH |
| --- | --- | --- | --- | --- |
| Root canvas | `8` | `{ x: 0, y: 0 }` | `{ x: 720, y: 1280 }` | yes |
| Lollipop group | `9` | `{ x: 0, y: 250 }` | `{ x: 720, y: 1280 }` | yes |
| Hidden lollipop templates | `10`-`24` | `{ x: 0, y: 0 }` | `{ x: 60, y: 133.5652 }` | no |
| Active lollipop | `25` | `{ x: 0, y: -200 }` | `{ x: 60, y: 133.5652 }` | yes |
| Target lollipop | `26` | `{ x: 0, y: -200 }` | `{ x: 60, y: 133.5652 }` | yes |
| Roulette | `27` | `{ x: 0, y: 250 }` | `{ x: 250, y: 250 }` | yes |
| Spiral | `28` | `{ x: 0, y: 250 }` | `{ x: 218, y: 218 }` | yes |
| Count | `29` | `{ x: 0, y: 250 }` | `{ x: 720, y: 1280 }` | yes |
| Tips | `30` | `{ x: 0, y: 50 }` | `{ x: 360, y: 1280 }` | yes |
| Challenge results | `31` | `{ x: 0, y: -60 }` | `{ x: 720, y: 1280 }` | scaled to 0 |
| Challenge result child | `32` | `{ x: 0, y: -70 }` | `{ x: 720, y: 1280 }` | parent scaled to 0 |
| Lollipop Border | `33` | `{ x: 0, y: -414 }` | `{ x: 720, y: 505.44 }` | yes |
| Left branch | `34` | `{ x: 0, y: 590 }` | `{ x: 722, y: 193.1914 }` | yes |

## Final Vincentt Layout

Runtime source: `src/lollipop/settings.ts`

All rows use:

```yaml
coordinateSpace: canvas
canvasSize: { width: 720, height: 1280 }
```

| Layer | position | size | rotation | renderOrder | Notes |
| --- | --- | --- | --- | --- | --- |
| `roulette` | `{ x: 0, y: 256 }` | `{ width: 252, height: 448 }` | `0` | `18` | Main wheel image. Size is a bounding rect; image uses `stretchMode: "fit"`. |
| `spiral` | `{ x: 0, y: 255 }` | `{ width: 218, height: 218 }` | `0` | `19` | Decorative rotating spiral above wheel. |
| `activeLollipop` | `{ x: 0, y: -200 }` | `{ width: 90, height: 160 }` | `180` | `16` | Bottom lollipop that launches on gesture. |
| `targetLollipop` | `{ x: 0, y: 64 }` | `{ width: 90, height: 160 }` | `180` | `16` | Placement source of truth for insertion point; not rendered in final idle/instruction scene. |
| `targetLollipopStickHitbox` | `{ x: 0, y: 81 }` | `{ width: 10, height: 100 }` | `180` | `26` | Authored null/guide object for collision stick region. Hidden in final render. |
| `targetLollipopHeadHitbox` | `{ x: 0, y: 17 }` | `{ width: 67, height: 60 }` | `180` | `26` | Authored null/guide object for collision head region. Hidden in final render. |
| `count` | `{ x: 0, y: 243.6 }` | `{ width: 250, height: 250 }` | `0` | `20` | Score/count text. |
| `timer` | `{ x: 258, y: 534 }` | `{ width: 180, height: 110 }` | `0` | `23` | 20 second timer; pulses near zero. |
| `tips` | `{ x: 0, y: 72 }` | `{ width: 620, height: 220 }` | `0` | `21` | Instruction text. |
| `challengeResult` | `{ x: 0, y: 74.4 }` | `{ width: 620, height: 220 }` | `0` | `22` | End-state result text; hidden until game ends. |
| `bottomFrame` | `{ x: 0, y: -414 }` | `{ width: 720, height: 505.44 }` | `0` | `24` | Foreground candy pile/frame. |
| `leftBranch` | `{ x: 0, y: 590 }` | `{ width: 722, height: 193.1914 }` | `0` | `25` | Top candy drip/branch. |

## Gameplay Mapping

- `ImageRenderer` -> `<ScreenImage>`
- `Text` -> `<ScreenText>`
- Effect House screen hierarchy -> `<ScreenSpaceUI>`
- Effect House camera/effect nodes -> `VideoBackground`
- Audio components -> browser `Audio` objects loaded from `public/audios`
- Effect House gesture/click trigger -> `GestureTracker` + `useGestureHold`
- Effect House collider/rigid body -> authored canvas-space oriented boxes

## Runtime Rules

- Peace sign is the shooting gesture (`victory`).
- One continuous peace sign fires one shot only.
- The gesture must be released/re-armed before another shot can fire.
- Game timer is 20 seconds.
- Win score is 10.
- Roulette rotates at `120 deg/s` while running.
- Spiral rotates slowly while idle and faster while running.
- Active lollipop gently bobs while waiting.
- Inserted lollipops snap/pop once when they stick.
- Timer pulses when `timeLeft <= 5`.
- Result text fades in on game end.

## Collision Model

The lollipop visual uses a full `90 x 160` screen-image rectangle, but collision
does not use the full image bounds. Full-image bounds felt wrong because the
transparent image rectangle and stick area made collisions appear early.

Instead, two hidden authored null/guide layers define collision:

```text
targetLollipop
  targetLollipopStickHitbox
  targetLollipopHeadHitbox
```

At runtime those two hitbox transforms are read relative to `targetLollipop`.
Each inserted lollipop carries the same relative regions as it rotates around
the roulette. Collision is SAT between these rotated rectangles.

The hitbox layers remain in `src/lollipop/settings.ts` as authoring data, but
they are not rendered in the final game scene.

## SDK Notes From This Transfer

- Effect House Screen Transform `size` is the bounding rectangle, not the image
  natural pixel size.
- `stretchMode: "fit"` affects texture placement inside the rectangle only; it
  should not affect rigid transform or rotation.
- SDK canvas space was added so projects can keep 720x1280 Effect House values
  directly instead of pre-normalizing in each project.
- Debug panels from `@vincentt-sdks/xr-sdk/debug-ui` were used during transfer
  and removed from the final scene.
