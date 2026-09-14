import { ScreenImage } from "@vincentt-xr/sdk";
import { Html } from "@react-three/drei";

import type { LollipopLayerSettings } from "./settings";
import { GAME_CONFIG } from "./gameConfig";

export const LollipopImageLayer = ({
  layer,
  position,
  size,
  opacity,
  rotation,
}: {
  layer: LollipopLayerSettings;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  opacity?: number;
  rotation?: number;
}) => {
  const value = layer.image?.screenImage;
  if (!value?.enabled || !layer.enabled || !layer.visible || !value.transformation.visible) {
    return null;
  }

  const { transformation: transform, image } = value;
  const finalPosition = position ?? transform.position;
  const finalSize = size ?? transform.size;

  return (
    <ScreenImage
      name={layer.id}
      src={image.src}
      coordinateSpace={transform.coordinateSpace}
      canvasSize={transform.canvasSize}
      position={[finalPosition.x, finalPosition.y]}
      size={[finalSize.width, finalSize.height]}
      rotation={rotation ?? transform.rotation}
      pivot={transform.pivot}
      stretchMode={image.stretchMode}
      materialType={image.materialType}
      blendMode={image.blendMode}
      opacity={opacity ?? image.opacity}
      color={image.color}
      flipX={image.flipX}
      flipY={image.flipY}
      transparent={image.transparent}
      alphaTest={image.alphaTest}
      overlay={transform.overlay}
      renderOrder={layer.renderOrder}
      visible={layer.visible}
    />
  );
};

export const LollipopTextLayer = ({
  layer,
  text,
  position,
  opacity,
}: {
  layer: LollipopLayerSettings;
  text?: string;
  position?: { x: number; y: number };
  opacity?: number;
}) => {
  const value = layer.text?.screenText;
  if (!value?.enabled || !layer.enabled || !layer.visible || !value.transformation.visible) {
    return null;
  }

  const { transformation: transform, style } = value;
  const finalPosition = position ?? transform.position;
  let justifyContent = "center";
  if (value.layout.textAlign === "left") justifyContent = "flex-start";
  if (value.layout.textAlign === "right") justifyContent = "flex-end";
  const isChallengeResult = layer.id === "challengeResult";

  return (
    <Html
      calculatePosition={(_el, _camera, size) => [
        size.width / 2 + (finalPosition.x / 720) * size.width,
        size.height / 2 - (finalPosition.y / 1280) * size.height,
        0,
      ]}
      center
      zIndexRange={[20, 0]}
      style={{
        width: `${(transform.size.width / 720) * 100}vw`,
        height: `${(transform.size.height / 1280) * 100}vh`,
        transform: `translate(-50%, -50%) rotate(${transform.rotation}deg)`,
        opacity: opacity ?? style.opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent,
          color: style.color,
          fontFamily: style.fontFamily,
          fontSize: isChallengeResult
            ? "28px"
            : `${Math.max(16, style.fontSize * 0.32)}px`,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          textDecoration: style.underline ? "underline" : "none",
          textAlign: value.layout.textAlign,
          whiteSpace: "pre-line",
          overflow: "hidden",
          overflowWrap: "anywhere",
          lineHeight: 1.05,
          textShadow: "2px 2px 0 #221108, -2px -2px 0 #221108, 2px -2px 0 #221108, -2px 2px 0 #221108",
        }}
      >
        {text ?? value.content.text}
      </div>
    </Html>
  );
};

export const CandyHud = ({
  status,
  score,
  targetScore,
  timeLeft,
  feedback,
  feedbackVersion,
  animationNow,
  onReset,
}: {
  status: "idle" | "running" | "ended";
  score: number;
  targetScore: number;
  timeLeft: number;
  feedback: string | null;
  feedbackVersion: number;
  animationNow: number;
  onReset?: () => void;
}) => {
  const progress = Math.min(100, (score / targetScore) * 100);
  const urgent = status === "running" && timeLeft <= GAME_CONFIG.hud.timerUrgencySeconds;
  const idleFloat = status === "idle" ? Math.sin(animationNow / 500) * 4 : 0;

  return (
    <Html fullscreen zIndexRange={[30, 0]}>
      <div className="candy-hud" style={{ pointerEvents: onReset ? "auto" : "none" }}>
        {status !== "ended" && (
          <div className="candy-hud__topbar">
            <div className={`candy-hud__card ${score > 0 ? "candy-hud__card--pop" : ""}`}>
              <span className="candy-hud__label">SCORE</span>
              <strong>{score}</strong>
            </div>
            <div className="candy-hud__progress-wrap">
              <span className="candy-hud__progress-label">{score} / {targetScore}</span>
              <div className="candy-hud__progress-track">
                <div className="candy-hud__progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className={`candy-hud__card ${urgent ? "candy-hud__card--urgent" : ""}`}>
              <span className="candy-hud__label">TIME</span>
              <strong>{timeLeft}</strong>
            </div>
          </div>
        )}

        {status === "idle" && (
          <div
            className="candy-hud__instruction"
            style={{ transform: `translate(-50%, calc(-50% + ${idleFloat}px))` }}
          >
            <span>✦</span> Show Peace Sign to Start <span>✦</span>
          </div>
        )}

        {feedback && status === "running" && (
          <div key={feedbackVersion} className="candy-hud__feedback">{feedback}</div>
        )}

        {status === "ended" && (
          <div className="candy-hud__end-card">
            <div className="candy-hud__end-kicker">ROUND COMPLETE</div>
            <div className="candy-hud__end-title">{score >= targetScore ? "Sweet Victory!" : "Try Again!"}</div>
            <div className="candy-hud__end-score">{score} <span>/ {targetScore}</span></div>
            <div className="candy-hud__end-progress"><div style={{ width: `${progress}%` }} /></div>
            <div className="candy-hud__end-hint">Show Fist Sign to Reset</div>
          </div>
        )}
      </div>
    </Html>
  );
};
