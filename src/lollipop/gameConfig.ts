/**
 * Remix surface for the lollipop game.
 * Change gameplay feel here; keep authored object placement in settings.ts.
 */
export const GAME_CONFIG = {
  durationSeconds: 20,
  targetScore: 10,
  gesture: {
    startAndShoot: "victory",
    reset: "closed_fist",
    armDelayMs: 250,
  },
  animation: {
    hitSeconds: 0.34,
    rouletteSpeedDegPerSecond: 120,
    spiralSpeedDegPerSecond: 220,
    idleSpiralSpeedDegPerSecond: 70,
    snapMs: 140,
    feedbackMs: 700,
  },
  hud: {
    timerUrgencySeconds: 5,
  },
} as const;
