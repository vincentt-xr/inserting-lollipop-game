import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ScreenSpaceUI } from "@vincentt-xr/sdk";
import { GestureTracker } from "@vincentt-xr/sdk/tracking";

import { CandyHud, LollipopImageLayer } from "./LollipopLayer";
import { GAME_CONFIG } from "./gameConfig";
import { useGestureHold } from "../gesture";
import type {
  LollipopLayerSettings,
  LollipopSettings,
} from "./settings";

const GAME_LOGIC_ENABLED = true;
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

type GameStatus = "idle" | "running" | "ended";
type ScreenPoint = { x: number; y: number };
type ScreenSize = { width: number; height: number };
type StuckLollipop = {
  id: number;
  localAngleDeg: number;
  localRadius: number;
  insertedAt: number;
};
type OrientedBox = {
  center: ScreenPoint;
  axes: [ScreenPoint, ScreenPoint];
  half: ScreenPoint;
};

const audioSources = {
  hit: "/audios/Knocking%20the%20wood.mp3",
  fail: "/audios/Error%20sound%20effects.mp3",
  victory: "/audios/Victory%202.mp3",
} as const;

const getLayerPosition = (layer: LollipopLayerSettings): ScreenPoint => {
  const transform =
    layer.image?.screenImage.transformation ??
    layer.text?.screenText.transformation;

  return transform?.position ?? { x: 0, y: 0 };
};

const getLayerSize = (layer: LollipopLayerSettings) => {
  const transform =
    layer.image?.screenImage.transformation ??
    layer.text?.screenText.transformation;

  return transform?.size ?? { width: 0.2, height: 0.2 };
};

const getLayerRotation = (layer: LollipopLayerSettings) => {
  const transform =
    layer.image?.screenImage.transformation ??
    layer.text?.screenText.transformation;

  return transform?.rotation ?? 0;
};

const scaleSize = (size: ScreenSize, scale: number): ScreenSize => ({
  width: size.width * scale,
  height: size.height * scale,
});

const rotatePoint = (point: ScreenPoint, rotationDeg: number): ScreenPoint => {
  const radians = rotationDeg * DEG_TO_RAD;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos,
  };
};

const layerWithVisible = (
  layer: LollipopLayerSettings,
  visible: boolean,
): LollipopLayerSettings => ({ ...layer, visible });

const normalizeDeg = (value: number) => ((value % 360) + 360) % 360;

const distanceBetween = (a: ScreenPoint, b: ScreenPoint) =>
  Math.hypot(b.x - a.x, b.y - a.y);

const angleBetween = (from: ScreenPoint, to: ScreenPoint) =>
  normalizeDeg(Math.atan2(to.y - from.y, to.x - from.x) * RAD_TO_DEG);

const polarPoint = (
  center: ScreenPoint,
  radius: number,
  angleDeg: number,
): ScreenPoint => {
  const radians = angleDeg * DEG_TO_RAD;
  return {
    x: center.x + Math.cos(radians) * radius,
    y: center.y + Math.sin(radians) * radius,
  };
};

const lollipopRotationForAngle = (worldAngleDeg: number) => worldAngleDeg + 270;

const worldFromLocalAngle = (
  localAngleDeg: number,
  rouletteRotationDeg: number,
) => normalizeDeg(localAngleDeg + rouletteRotationDeg);

const localFromWorldAngle = (
  worldAngleDeg: number,
  rouletteRotationDeg: number,
) => normalizeDeg(worldAngleDeg - rouletteRotationDeg);

const createOrientedBox = (
  center: ScreenPoint,
  size: { width: number; height: number },
  rotationDeg: number,
): OrientedBox => {
  const radians = rotationDeg * DEG_TO_RAD;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    center,
    axes: [
      { x: cos, y: sin },
      { x: -sin, y: cos },
    ],
    half: {
      x: size.width / 2,
      y: size.height / 2,
    },
  };
};

const dot = (a: ScreenPoint, b: ScreenPoint) => a.x * b.x + a.y * b.y;

const projectedRadius = (box: OrientedBox, axis: ScreenPoint) =>
  box.half.x * Math.abs(dot(box.axes[0], axis)) +
  box.half.y * Math.abs(dot(box.axes[1], axis));

const boxesOverlap = (a: OrientedBox, b: OrientedBox) => {
  const centerDelta = {
    x: b.center.x - a.center.x,
    y: b.center.y - a.center.y,
  };
  const axes = [a.axes[0], a.axes[1], b.axes[0], b.axes[1]];

  return axes.every((axis) => {
    const distance = Math.abs(dot(centerDelta, axis));
    return distance <= projectedRadius(a, axis) + projectedRadius(b, axis);
  });
};

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

const playSound = (source: string) => {
  const audio = new Audio(source);
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Browser autoplay policies can block sound before the first user gesture.
  });
};

export const LollipopGame = ({
  settings: initialSettings,
}: {
  settings: LollipopSettings;
}) => {
  const settings = initialSettings;
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONFIG.durationSeconds);
  const [activePosition, setActivePosition] = useState<ScreenPoint | null>(
    null,
  );
  const [stuckLollipops, setStuckLollipops] = useState<StuckLollipop[]>([]);
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const [spiralRotation, setSpiralRotation] = useState(0);
  const [animationNow, setAnimationNow] = useState(() => performance.now());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const rouletteRotationRef = useRef(0);
  const stuckLollipopsRef = useRef<StuckLollipop[]>([]);
  const launchRef = useRef<{
    startedAt: number;
    from: ScreenPoint;
    to: ScreenPoint;
  } | null>(null);
  const lastHitAtRef = useRef(0);
  const endAtRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const stuckIdRef = useRef(0);
  const feedbackTimerRef = useRef<number | null>(null);
  const { layers } = settings;

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    stuckLollipopsRef.current = stuckLollipops;
  }, [stuckLollipops]);

  const activeStartPosition = useMemo(
    () => getLayerPosition(layers.activeLollipop),
    [layers.activeLollipop],
  );
  const targetPosition = useMemo(
    () => getLayerPosition(layers.targetLollipop),
    [layers.targetLollipop],
  );
  const roulettePosition = useMemo(
    () => getLayerPosition(layers.roulette),
    [layers.roulette],
  );
  const activeLollipopSize = useMemo(
    () => getLayerSize(layers.activeLollipop),
    [layers.activeLollipop],
  );
  const targetLollipopRotation = useMemo(
    () => getLayerRotation(layers.targetLollipop),
    [layers.targetLollipop],
  );
  const hitboxTemplates = useMemo(
    () =>
      // The hidden hitboxes are authored beside the visible target. Their
      // offsets must stay relative so the collision shape follows the wheel.
      [layers.targetLollipopStickHitbox, layers.targetLollipopHeadHitbox].map(
        (layer) => {
          const position = getLayerPosition(layer);
          return {
            offset: {
              x: position.x - targetPosition.x,
              y: position.y - targetPosition.y,
            },
            size: getLayerSize(layer),
            rotationOffset: getLayerRotation(layer) - targetLollipopRotation,
          };
        },
      ),
    [
      layers.targetLollipopHeadHitbox,
      layers.targetLollipopStickHitbox,
      targetLollipopRotation,
      targetPosition,
    ],
  );
  const rouletteSize = useMemo(
    () => getLayerSize(layers.roulette),
    [layers.roulette],
  );
  const hitWorldAngle = useMemo(
    () => angleBetween(roulettePosition, targetPosition),
    [roulettePosition, targetPosition],
  );
  const hitRadius = useMemo(
    () => distanceBetween(roulettePosition, targetPosition),
    [roulettePosition, targetPosition],
  );
  const createLollipopCollisionBoxes = useCallback(
    (center: ScreenPoint, rotation: number) =>
      hitboxTemplates.map((template) => {
        const offset = rotatePoint(template.offset, rotation - targetLollipopRotation);

        return createOrientedBox(
          { x: center.x + offset.x, y: center.y + offset.y },
          template.size,
          rotation + template.rotationOffset,
        );
      }),
    [hitboxTemplates, targetLollipopRotation],
  );

  const resetGame = useCallback(() => {
    setStatus("running");
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(GAME_CONFIG.durationSeconds);
    setActivePosition(activeStartPosition);
    setStuckLollipops([]);
    stuckLollipopsRef.current = [];
    launchRef.current = null;
    endAtRef.current = performance.now() + GAME_CONFIG.durationSeconds * 1000;
    setFeedback(null);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [activeStartPosition]);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    setFeedbackVersion((version) => version + 1);
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    // Feedback is presentation-only; it expires without changing gameplay.
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, GAME_CONFIG.animation.feedbackMs);
  }, []);

  const endGame = useCallback(
    (result?: "win" | "lose") => {
      const won = result ? result === "win" : scoreRef.current >= GAME_CONFIG.targetScore;
      setStatus("ended");
      setTimeLeft(0);
      setActivePosition(activeStartPosition);
      launchRef.current = null;
      endAtRef.current = null;
      playSound(won ? audioSources.victory : audioSources.fail);
    },
    [activeStartPosition],
  );

  useEffect(() => {
    if (!GAME_LOGIC_ENABLED) return undefined;
    if (status !== "running") return undefined;

    const interval = window.setInterval(() => {
      const endAt = endAtRef.current;
      if (!endAt) return;

      const remainingMs = Math.max(0, endAt - performance.now());
      setTimeLeft(Math.ceil(remainingMs / 1000));

      if (remainingMs <= 0) {
        window.clearInterval(interval);
        endGame();
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [endGame, status]);

  useFrame((_state, delta) => {
    if (!GAME_LOGIC_ENABLED) return;

    setAnimationNow(performance.now());

    if (status === "running") {
      const nextRouletteRotation = normalizeDeg(
        rouletteRotationRef.current + GAME_CONFIG.animation.rouletteSpeedDegPerSecond * delta,
      );
      rouletteRotationRef.current = nextRouletteRotation;
      setRouletteRotation(nextRouletteRotation);
    }
    if (status !== "ended") {
      const spiralSpeed =
        status === "running"
          ? GAME_CONFIG.animation.spiralSpeedDegPerSecond
          : GAME_CONFIG.animation.idleSpiralSpeedDegPerSecond;
      setSpiralRotation((current) => normalizeDeg(current + spiralSpeed * delta));
    }

    const launch = launchRef.current;
    if (!launch) return;

    const elapsed = (performance.now() - launch.startedAt) / 1000;
    const progress = Math.min(1, elapsed / GAME_CONFIG.animation.hitSeconds);
    const eased = easeOutCubic(progress);

    setActivePosition({
      x: launch.from.x + (launch.to.x - launch.from.x) * eased,
      y: launch.from.y + (launch.to.y - launch.from.y) * eased,
    });

    if (progress < 1) return;

    launchRef.current = null;
    const currentRouletteRotation = rouletteRotationRef.current;
    const localAngleDeg = localFromWorldAngle(
      hitWorldAngle,
      currentRouletteRotation,
    );
    const incomingRotation = lollipopRotationForAngle(hitWorldAngle);
    const incomingBoxes = createLollipopCollisionBoxes(launch.to, incomingRotation);
    const collided = stuckLollipopsRef.current.some((lollipop) => {
      const worldAngle = worldFromLocalAngle(
        lollipop.localAngleDeg,
        currentRouletteRotation,
      );
      const stuckBoxes = createLollipopCollisionBoxes(
        polarPoint(roulettePosition, lollipop.localRadius, worldAngle),
        lollipopRotationForAngle(worldAngle),
      );
      return incomingBoxes.some((incomingBox) =>
        stuckBoxes.some((stuckBox) => boxesOverlap(incomingBox, stuckBox)),
      );
    });

    if (collided) {
      showFeedback("Too close!");
      endGame("lose");
      return;
    }

    const stuckId = stuckIdRef.current;
    stuckIdRef.current += 1;
    const nextStuck = [
      ...stuckLollipopsRef.current,
      {
        id: stuckId,
        localAngleDeg,
        localRadius: hitRadius,
        insertedAt: performance.now(),
      },
    ];
    stuckLollipopsRef.current = nextStuck;
    setStuckLollipops(nextStuck);
    setActivePosition(activeStartPosition);

    const nextScore = scoreRef.current + 1;
    scoreRef.current = nextScore;
    setScore(nextScore);
    let hitFeedback = "Nice!";
    if (nextScore >= 5) hitFeedback = "Sweet!";
    if (nextScore >= GAME_CONFIG.targetScore) hitFeedback = "Perfect!";
    showFeedback(hitFeedback);
    playSound(audioSources.hit);

    if (nextScore >= GAME_CONFIG.targetScore) {
      endGame("win");
    }
  });

  const hitLollipop = useCallback(() => {
    const now = performance.now();
    if (now - lastHitAtRef.current < 120) return;
    lastHitAtRef.current = now;

    if (status === "ended") {
      resetGame();
      return;
    }

    if (launchRef.current) return;

    if (status === "idle") {
      resetGame();
    } else if (status !== "running") {
      return;
    }

    launchRef.current = {
      startedAt: performance.now(),
      from: activePosition ?? activeStartPosition,
      to: targetPosition,
    };
  }, [activePosition, activeStartPosition, resetGame, status, targetPosition]);

  useGestureHold({
    // Peace sign is intentionally instant: one released gesture equals one shot.
    gesture: GAME_CONFIG.gesture.startAndShoot,
    holdMs: 0,
    armDelayMs: GAME_CONFIG.gesture.armDelayMs,
    enabled: GAME_LOGIC_ENABLED,
    onTrigger: hitLollipop,
  });

  useGestureHold({
    // Reset is gated to the end state so a fist cannot interrupt a live round.
    gesture: GAME_CONFIG.gesture.reset,
    holdMs: 0,
    armDelayMs: GAME_CONFIG.gesture.armDelayMs,
    enabled: GAME_LOGIC_ENABLED && status === "ended",
    onTrigger: resetGame,
  });

  const renderedStuckLollipops = stuckLollipops.map((lollipop) => {
    const worldAngle = worldFromLocalAngle(
      lollipop.localAngleDeg,
      rouletteRotation,
    );
    const snapProgress = Math.min(
      1,
      Math.max(0, (animationNow - lollipop.insertedAt) / GAME_CONFIG.animation.snapMs),
    );
    const snapScale = 1 + (1 - easeOutCubic(snapProgress)) * 0.12;
    return {
      id: lollipop.id,
      position: polarPoint(roulettePosition, lollipop.localRadius, worldAngle),
      rotation: lollipopRotationForAngle(worldAngle),
      size: scaleSize(activeLollipopSize, snapScale),
    };
  });
  const activeBasePosition = activePosition ?? activeStartPosition;
  const activeBobbing =
    !launchRef.current && status !== "ended"
      ? Math.sin(animationNow / 360) * 7
      : 0;
  const activeDisplayPosition = {
    x: activeBasePosition.x,
    y: activeBasePosition.y + activeBobbing,
  };
  const roulettePulse = 1 + Math.sin(animationNow / 680) * 0.012;
  const activeLayer = layerWithVisible(layers.activeLollipop, status !== "ended");
  const stuckLayer = layerWithVisible(
    layers.targetLollipop,
    stuckLollipops.length > 0,
  );

  return (
    <>
      <GestureTracker />
      <ScreenSpaceUI>
        <LollipopImageLayer
          layer={activeLayer}
          position={activeDisplayPosition}
        />
        {renderedStuckLollipops.map((lollipop) => (
          <LollipopImageLayer
            key={lollipop.id}
            layer={stuckLayer}
            position={lollipop.position}
            rotation={lollipop.rotation}
            size={lollipop.size}
          />
        ))}
        <LollipopImageLayer
          layer={layers.roulette}
          rotation={rouletteRotation}
          size={scaleSize(rouletteSize, roulettePulse)}
        />
        <LollipopImageLayer layer={layers.spiral} rotation={spiralRotation} />
        <LollipopImageLayer layer={layers.bottomFrame} />
        <LollipopImageLayer layer={layers.leftBranch} />
      </ScreenSpaceUI>
      <CandyHud
        status={status}
        score={score}
        targetScore={GAME_CONFIG.targetScore}
        timeLeft={timeLeft}
        feedback={feedback}
        feedbackVersion={feedbackVersion}
        animationNow={animationNow}
      />
    </>
  );
};
