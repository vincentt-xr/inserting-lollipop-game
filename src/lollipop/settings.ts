/**
 * The game's hit geometry, in 720 x 1280 design-canvas pixels (centre origin, +y up).
 *
 * The pictures themselves are written out as literal `ScreenImage`s in
 * LollipopImages.tsx, so the console's visual editor can swap and move them.
 * These numbers are what the game logic aims and collides with; they match the
 * pictures' authored placement. Moving a picture in the editor does not move its
 * hit area: change it here too.
 */
export type ScreenPoint = { x: number; y: number };
export type ScreenSize = { width: number; height: number };
export type HitShape = { position: ScreenPoint; size: ScreenSize; rotation: number };

export const LOLLIPOP_GEOMETRY = {
  roulette: { position: { x: 0, y: 256 }, size: { width: 252, height: 448 }, rotation: 0 },
  spiral: { position: { x: 0, y: 255 }, size: { width: 218, height: 218 }, rotation: 0 },
  activeLollipop: { position: { x: 0, y: -200 }, size: { width: 90, height: 160 }, rotation: 180 },
  targetLollipop: { position: { x: 0, y: 64 }, size: { width: 90, height: 160 }, rotation: 180 },
  // Hidden collision boxes, authored beside the target lollipop. Their offsets
  // stay relative to it so the collision shape follows the wheel.
  targetLollipopStickHitbox: { position: { x: 0, y: 81 }, size: { width: 10, height: 100 }, rotation: 180 },
  targetLollipopHeadHitbox: { position: { x: 0, y: 17 }, size: { width: 67, height: 60 }, rotation: 180 },
} satisfies Record<string, HitShape>;
