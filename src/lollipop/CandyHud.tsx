// The game's HUD, drawn in the scene so the console's visual editor can reach it.
//
// Every fixed word is a `ScreenText` with a literal `text`, and every card is a
// `ScreenShape` with literal settings and placement, so the editor can retype,
// recolour, move and resize them. Numbers (score, time, the progress fill) are
// game state and can only change in code. Animations run on `Pivot` groups.
//
// Placement is in 720 x 1280 design pixels (centre origin, +y up): twice the CSS
// pixels of the old DOM HUD on a 360-pixel-wide phone.
import { ScreenShape, ScreenText } from "@vincentt-xr/sdk";

import { Pivot } from "./LollipopImages";

export type FeedbackKey = "nice" | "sweet" | "perfect" | "tooClose";

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** `candy-score-pop`: 1 -> 1.18 (and -2 degrees) -> 1 over 420 ms. */
const popAt = (elapsedMs: number) => {
  if (elapsedMs < 0 || elapsedMs >= 420) return { scale: 1, rotation: 0 };
  const wave = Math.sin((elapsedMs / 420) * Math.PI);
  return { scale: 1 + 0.18 * wave, rotation: 2 * wave };
};

/** `candy-feedback-in`, 700 ms: pops in by 18%, then rises and fades. */
const feedbackAt = (elapsedMs: number) => {
  const t = clamp01(elapsedMs / 700);
  if (t < 0.18) {
    const k = easeOut(t / 0.18);
    return { opacity: k, y: -24 + 24 * k, scale: 0.7 + 0.38 * k };
  }
  const k = (t - 0.18) / 0.82;
  return { opacity: 1 - k, y: 36 * k, scale: 1.08 - 0.08 * k };
};

/** `candy-end-in`, 500 ms with a slight overshoot. */
const endCardAt = (elapsedMs: number) => {
  const t = clamp01(elapsedMs / 500);
  const k = 1 - (1 - t) ** 3 + Math.sin(t * Math.PI) * 0.06;
  return { scale: 0.78 + 0.22 * k, y: -30 * (1 - t) };
};

export const CandyHud = ({
  status,
  score,
  targetScore,
  timeLeft,
  urgent,
  progress,
  feedback,
  feedbackStartedAt,
  scorePopStartedAt,
  endedAt,
  now,
}: {
  status: "idle" | "running" | "ended";
  score: number;
  targetScore: number;
  timeLeft: number;
  urgent: boolean;
  /** 0..1, already eased toward the score. */
  progress: number;
  feedback: FeedbackKey | null;
  feedbackStartedAt: number;
  scorePopStartedAt: number | null;
  endedAt: number;
  now: number;
}) => {
  const playing = status !== "ended";
  const idleFloat = status === "idle" ? Math.sin(now / 500) * 4 : 0;
  const pop = popAt(scorePopStartedAt === null ? -1 : now - scorePopStartedAt);
  const timerPulse = urgent ? 1 + 0.08 * (0.5 - 0.5 * Math.cos((now / 700) * Math.PI * 2)) : 1;
  const fb = feedbackAt(now - feedbackStartedAt);
  const showFeedback = feedback !== null && status === "running";
  const endCard = endCardAt(now - endedAt);
  const won = score >= targetScore;
  const barWidth = 300 * progress;
  const endBarWidth = 540 * progress;

  return (
    <>
      {/* Top bar: score card, progress card, time card. */}
      <Pivot at={{ x: -264, y: 552 }} rotation={pop.rotation} scale={pop.scale}>
        <ScreenShape name="Score card shadow" visible={playing} settings={{ kind: "roundedRectangle", fillColor: "#8b204f", cornerRadius: 0.35 }} transform={{ position: { x: -264, y: 542 }, size: { width: 136, height: 104 }, rotation: 0, renderOrder: 100 }} />
        <ScreenShape name="Score card" visible={playing} settings={{ kind: "roundedRectangle", fillMode: "gradient", gradient: { type: "linear", angle: -45, stops: [{ offset: 0, color: "#ff80b5" }, { offset: 1, color: "#d92e78" }] }, fillColor: "#d92e78", strokeColor: "#fff0c4", strokeWidth: 6, cornerRadius: 0.35 }} transform={{ position: { x: -264, y: 552 }, size: { width: 136, height: 104 }, rotation: 0, renderOrder: 101 }} />
        <ScreenText name="Score label" visible={playing} text="SCORE" screenTransform={{ position: { x: -264, y: 578 }, size: { width: 136, height: 24 }, rotation: 0, renderOrder: 102 }} fontSize={18} fontWeight={800} letterSpacing={0.12} color="#fff8e8" bgColor="transparent" padding={0} />
        <ScreenText name="Score value" visible={playing} text={String(score)} screenTransform={{ position: { x: -264, y: 536 }, size: { width: 136, height: 60 }, rotation: 0, renderOrder: 102 }} fontSize={52} fontWeight={900} color="#fff8e8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 4, offsetY: 4 }]} />
      </Pivot>

      <ScreenShape name="Progress card shadow" visible={playing} settings={{ kind: "roundedRectangle", fillColor: "#9b6420", cornerRadius: 0.375 }} transform={{ position: { x: 0, y: 546 }, size: { width: 340, height: 96 }, rotation: 0, renderOrder: 100 }} />
      <ScreenShape name="Progress card" visible={playing} settings={{ kind: "roundedRectangle", fillMode: "gradient", gradient: { type: "linear", angle: -45, stops: [{ offset: 0, color: "#ffe98b" }, { offset: 1, color: "#f4ad39" }] }, fillColor: "#f4ad39", strokeColor: "#fff9df", strokeWidth: 6, cornerRadius: 0.375 }} transform={{ position: { x: 0, y: 556 }, size: { width: 340, height: 96 }, rotation: 0, renderOrder: 101 }} />
      <ScreenText name="Progress value" visible={playing} text={`${score} / ${targetScore}`} screenTransform={{ position: { x: 0, y: 572 }, size: { width: 300, height: 36 }, rotation: 0, renderOrder: 102 }} fontSize={24} fontWeight={900} color="#71351e" bgColor="transparent" padding={0} />
      <ScreenShape name="Progress track" visible={playing} settings={{ kind: "roundedRectangle", fillColor: "#8b4b35", fillOpacity: 0.4, cornerRadius: 0.5 }} transform={{ position: { x: 0, y: 535 }, size: { width: 300, height: 18 }, rotation: 0, renderOrder: 102 }} />
      <ScreenShape name="Progress fill" visible={playing && barWidth > 1} settings={{ kind: "roundedRectangle", fillMode: "gradient", gradient: { type: "linear", angle: 0, stops: [{ offset: 0, color: "#fff9df" }, { offset: 1, color: "#ff75b5" }] }, fillColor: "#ff75b5", cornerRadius: 0.5 }} transform={{ position: { x: -150 + barWidth / 2, y: 535 }, size: { width: barWidth, height: 18 }, rotation: 0, renderOrder: 103 }} />

      <Pivot at={{ x: 264, y: 552 }} scale={timerPulse}>
        <ScreenShape name="Time card shadow" visible={playing} settings={{ kind: "roundedRectangle", fillColor: "#8b204f", cornerRadius: 0.35 }} transform={{ position: { x: 264, y: 542 }, size: { width: 136, height: 104 }, rotation: 0, renderOrder: 100 }} />
        <ScreenShape name="Time card" visible={playing && !urgent} settings={{ kind: "roundedRectangle", fillMode: "gradient", gradient: { type: "linear", angle: -45, stops: [{ offset: 0, color: "#ff80b5" }, { offset: 1, color: "#d92e78" }] }, fillColor: "#d92e78", strokeColor: "#fff0c4", strokeWidth: 6, cornerRadius: 0.35 }} transform={{ position: { x: 264, y: 552 }, size: { width: 136, height: 104 }, rotation: 0, renderOrder: 101 }} />
        <ScreenShape name="Time card, last seconds" visible={playing && urgent} settings={{ kind: "roundedRectangle", fillMode: "gradient", gradient: { type: "linear", angle: -45, stops: [{ offset: 0, color: "#ffb347" }, { offset: 1, color: "#e94b42" }] }, fillColor: "#e94b42", strokeColor: "#fff0c4", strokeWidth: 6, cornerRadius: 0.35 }} transform={{ position: { x: 264, y: 552 }, size: { width: 136, height: 104 }, rotation: 0, renderOrder: 101 }} />
        <ScreenText name="Time label" visible={playing} text="TIME" screenTransform={{ position: { x: 264, y: 578 }, size: { width: 136, height: 24 }, rotation: 0, renderOrder: 102 }} fontSize={18} fontWeight={800} letterSpacing={0.12} color="#fff8e8" bgColor="transparent" padding={0} />
        <ScreenText name="Time value" visible={playing} text={String(timeLeft)} screenTransform={{ position: { x: 264, y: 536 }, size: { width: 136, height: 60 }, rotation: 0, renderOrder: 102 }} fontSize={52} fontWeight={900} color="#fff8e8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 4, offsetY: 4 }]} />
      </Pivot>

      {/* Idle prompt, floating gently. */}
      <Pivot at={{ x: 0, y: 0 }} offset={{ x: 0, y: -2 * idleFloat }}>
        <ScreenShape name="Start prompt shadow" visible={status === "idle"} settings={{ kind: "roundedRectangle", fillColor: "#8b204f", cornerRadius: 0.5 }} transform={{ position: { x: 0, y: -8 }, size: { width: 640, height: 66 }, rotation: 0, renderOrder: 110 }} />
        <ScreenText name="Start prompt" visible={status === "idle"} text="✦ Show Peace Sign to Start ✦" screenTransform={{ position: { x: 0, y: 0 }, size: { width: 640, height: 66 }, rotation: 0, renderOrder: 111 }} fontSize={26} fontWeight={800} color="#fff8e8" bgColor="#d92e78" bgOpacity={0.91} borderColor="#fff0c4" borderWidth={4} borderRadius={33} padding={0} />
      </Pivot>

      {/* Hit feedback: one literal line per message; the game picks which shows. */}
      <Pivot at={{ x: 0, y: 170 }} offset={{ x: 0, y: fb.y }} scale={fb.scale}>
        <ScreenText name="Feedback, first hits" visible={showFeedback && feedback === "nice"} opacity={fb.opacity} text="Nice!" screenTransform={{ position: { x: 0, y: 170 }, size: { width: 600, height: 90 }, rotation: 0, renderOrder: 120 }} fontSize={58} fontWeight={900} color="#fff3a8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 6, offsetY: 6 }]} />
        <ScreenText name="Feedback, five hits" visible={showFeedback && feedback === "sweet"} opacity={fb.opacity} text="Sweet!" screenTransform={{ position: { x: 0, y: 170 }, size: { width: 600, height: 90 }, rotation: 0, renderOrder: 120 }} fontSize={58} fontWeight={900} color="#fff3a8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 6, offsetY: 6 }]} />
        <ScreenText name="Feedback, target reached" visible={showFeedback && feedback === "perfect"} opacity={fb.opacity} text="Perfect!" screenTransform={{ position: { x: 0, y: 170 }, size: { width: 600, height: 90 }, rotation: 0, renderOrder: 120 }} fontSize={58} fontWeight={900} color="#fff3a8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 6, offsetY: 6 }]} />
        <ScreenText name="Feedback, collision" visible={showFeedback && feedback === "tooClose"} opacity={fb.opacity} text="Too close!" screenTransform={{ position: { x: 0, y: 170 }, size: { width: 600, height: 90 }, rotation: 0, renderOrder: 120 }} fontSize={58} fontWeight={900} color="#fff3a8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 6, offsetY: 6 }]} />
      </Pivot>

      {/* End card. */}
      <Pivot at={{ x: 0, y: 154 }} offset={{ x: 0, y: endCard.y }} scale={endCard.scale}>
        <ScreenShape name="End card shadow" visible={!playing} settings={{ kind: "roundedRectangle", fillColor: "#721b43", cornerRadius: 0.15 }} transform={{ position: { x: 0, y: 138 }, size: { width: 620, height: 372 }, rotation: 0, renderOrder: 130 }} />
        <ScreenShape name="End card" visible={!playing} settings={{ kind: "roundedRectangle", fillMode: "gradient", gradient: { type: "linear", angle: -45, stops: [{ offset: 0, color: "#ff80b5" }, { offset: 1, color: "#b92769" }] }, fillColor: "#b92769", strokeColor: "#fff0c4", strokeWidth: 8, cornerRadius: 0.15 }} transform={{ position: { x: 0, y: 154 }, size: { width: 620, height: 372 }, rotation: 0, renderOrder: 131 }} />
        <ScreenText name="End kicker" visible={!playing} text="ROUND COMPLETE" screenTransform={{ position: { x: 0, y: 284 }, size: { width: 540, height: 24 }, rotation: 0, renderOrder: 132 }} fontSize={20} fontWeight={900} letterSpacing={0.18} color="#fff8e8" bgColor="transparent" padding={0} />
        <ScreenText name="End title, won" visible={!playing && won} text="Sweet Victory!" screenTransform={{ position: { x: 0, y: 227 }, size: { width: 540, height: 70 }, rotation: 0, renderOrder: 132 }} fontSize={58} fontWeight={900} color="#fff9c8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 6, offsetY: 6 }]} />
        <ScreenText name="End title, lost" visible={!playing && !won} text="Try Again!" screenTransform={{ position: { x: 0, y: 227 }, size: { width: 540, height: 70 }, rotation: 0, renderOrder: 132 }} fontSize={58} fontWeight={900} color="#fff9c8" bgColor="transparent" padding={0} shadowLayers={[{ color: "#8b204f", blur: 0, offsetX: 6, offsetY: 6 }]} />
        <ScreenText name="End score" visible={!playing} text={`${score} / ${targetScore}`} screenTransform={{ position: { x: 0, y: 140 }, size: { width: 540, height: 84 }, rotation: 0, renderOrder: 132 }} fontSize={72} fontWeight={900} color="#fff8e8" bgColor="transparent" padding={0} />
        <ScreenShape name="End progress track" visible={!playing} settings={{ kind: "roundedRectangle", fillColor: "#8b4b35", fillOpacity: 0.4, cornerRadius: 0.5 }} transform={{ position: { x: 0, y: 79 }, size: { width: 540, height: 18 }, rotation: 0, renderOrder: 132 }} />
        <ScreenShape name="End progress fill" visible={!playing && endBarWidth > 1} settings={{ kind: "roundedRectangle", fillMode: "gradient", gradient: { type: "linear", angle: 0, stops: [{ offset: 0, color: "#fff9df" }, { offset: 1, color: "#ff75b5" }] }, fillColor: "#ff75b5", cornerRadius: 0.5 }} transform={{ position: { x: -270 + endBarWidth / 2, y: 79 }, size: { width: endBarWidth, height: 18 }, rotation: 0, renderOrder: 133 }} />
        <ScreenText name="End hint" visible={!playing} text="Show Fist Sign to Reset" screenTransform={{ position: { x: 0, y: 25 }, size: { width: 540, height: 34 }, rotation: 0, renderOrder: 132 }} fontSize={28} fontWeight={800} color="#fff8e8" bgColor="transparent" padding={0} />
      </Pivot>
    </>
  );
};
