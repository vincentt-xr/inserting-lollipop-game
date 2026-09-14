import {
  DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS,
  DEFAULT_SCREEN_TEXT_SCENE_SETTINGS,
  type ScreenImageSceneSettings,
  type ScreenTextSceneSettings,
} from "@vincentt-xr/sdk";

export type LollipopLayerKind = "image" | "text";

export type LollipopLayerId =
  | "roulette"
  | "spiral"
  | "leftBranch"
  | "bottomFrame"
  | "activeLollipop"
  | "targetLollipop"
  | "targetLollipopStickHitbox"
  | "targetLollipopHeadHitbox"
  | "count"
  | "timer"
  | "tips"
  | "challengeResult";

export type LollipopLayerSettings = {
  id: LollipopLayerId;
  label: string;
  kind: LollipopLayerKind;
  visible: boolean;
  enabled: boolean;
  locked?: boolean;
  renderOrder: number;
  image?: ScreenImageSceneSettings;
  text?: ScreenTextSceneSettings;
};

export type LollipopSettings = {
  version: 1;
  layers: Record<LollipopLayerId, LollipopLayerSettings>;
};

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 1280;
// These are Effect House authoring pixels. Image layers keep this coordinate
// system so remixers can tune placement against the original scene directly.
export const LOLLIPOP_CANVAS_SIZE = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
};

const imageLayer = (
  id: LollipopLayerId,
  label: string,
  src: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  renderOrder: number,
  rotation = 0,
): LollipopLayerSettings => ({
  id,
  label,
  kind: "image",
  visible: true,
  enabled: true,
  renderOrder,
  image: {
    ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS,
    screenImage: {
      ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage,
      transformation: {
        ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage.transformation,
        coordinateSpace: "canvas",
        canvasSize: LOLLIPOP_CANVAS_SIZE,
        position,
        size,
        rotation,
        renderOrder,
        visible: true,
        overlay: true,
      },
      image: {
        ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage.image,
        sourceKind: "image",
        src,
        stretchMode: "fit",
        materialType: "unlit",
        transparent: true,
      },
    },
  },
});

const nullImageLayer = (
  id: LollipopLayerId,
  label: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  renderOrder: number,
  rotation = 0,
): LollipopLayerSettings => ({
  id,
  label,
  kind: "image",
  visible: true,
  enabled: true,
  renderOrder,
  image: {
    ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS,
    screenImage: {
      ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage,
      transformation: {
        ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage.transformation,
        coordinateSpace: "canvas",
        canvasSize: LOLLIPOP_CANVAS_SIZE,
        showFitGuides: true,
        position,
        size,
        rotation,
        renderOrder,
        visible: true,
        overlay: true,
      },
      image: {
        ...DEFAULT_SCREEN_IMAGE_SCENE_SETTINGS.screenImage.image,
        sourceKind: "default",
        src: "",
        stretchMode: "stretch",
        materialType: "unlit",
        opacity: 0.03,
        color: "#00e5ff",
        transparent: true,
      },
    },
  },
});

const textLayer = (
  id: LollipopLayerId,
  label: string,
  text: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  renderOrder: number,
  fontSize: number,
  options: {
    minFontSize?: number;
    shadowLayers?: NonNullable<ScreenTextSceneSettings["screenText"]["style"]["shadowLayers"]>;
  } = {},
): LollipopLayerSettings => ({
  id,
  label,
  kind: "text",
  visible: true,
  enabled: true,
  renderOrder,
  text: {
    ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS,
    screenText: {
      ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText,
      content: { text },
      transformation: {
        ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText.transformation,
        coordinateSpace: "canvas",
        canvasSize: LOLLIPOP_CANVAS_SIZE,
        position,
        size,
        renderOrder,
        visible: true,
        overlay: true,
      },
      style: {
        ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText.style,
        fontSize,
        color: "#ffffff",
        aspect: size.width / size.height,
        strokeLayers: [{ color: "#221108", width: 8, opacity: 1 }],
        shadowLayers: options.shadowLayers ?? [
          { color: "#000000", blur: 12, offsetX: 5, offsetY: -5, opacity: 0.45 },
        ],
      },
      layout: {
        ...DEFAULT_SCREEN_TEXT_SCENE_SETTINGS.screenText.layout,
        textAlign: "center",
        verticalAlign: "center",
        overflow: "shrink",
        resizeToFit: true,
        minFontSize: options.minFontSize ?? 16,
      },
    },
  },
});

export const DEFAULT_LOLLIPOP_SETTINGS: LollipopSettings = {
  version: 1,
  layers: {
    roulette: imageLayer(
      "roulette",
      "Roulette",
      "/images/Disk.png",
      { x: 0, y: 256 },
      { width: 252, height: 448 },
      18,
    ),
    spiral: imageLayer(
      "spiral",
      "Spiral",
      "/images/Spiral.png",
      { x: 0, y: 255 },
      { width: 218, height: 218 },
      19,
    ),
    activeLollipop: imageLayer(
      "activeLollipop",
      "Active Lollipop",
      "/images/Pink lollipop.png",
      { x: 0, y: -200 },
      { width: 90, height: 160 },
      16,
      180,
    ),
    targetLollipop: imageLayer(
      "targetLollipop",
      "Target Lollipop",
      "/images/Pink lollipop.png",
      { x: 0, y: 64 },
      { width: 90, height: 160 },
      16,
      180,
    ),
    targetLollipopStickHitbox: nullImageLayer(
      "targetLollipopStickHitbox",
      "Target Lollipop Stick Hitbox",
      { x: 0, y: 81 },
      { width: 10, height: 100 },
      26,
      180,
    ),
    targetLollipopHeadHitbox: nullImageLayer(
      "targetLollipopHeadHitbox",
      "Target Lollipop Head Hitbox",
      { x: 0, y: 17 },
      { width: 67, height: 60 },
      26,
      180,
    ),
    bottomFrame: imageLayer(
      "bottomFrame",
      "Lollipop Border",
      "/images/Bottom frame.png",
      { x: 0, y: -414 },
      { width: 720, height: 505.44 },
      24,
    ),
    leftBranch: imageLayer(
      "leftBranch",
      "Left Branch",
      "/images/Candy Drops.png",
      { x: 0, y: 590 },
      { width: 722, height: 193.1914 },
      25,
    ),
    count: textLayer(
      "count",
      "Count",
      "0",
      { x: 0, y: 243.6 },
      { width: 250, height: 250 },
      20,
      168,
      {
        minFontSize: 32,
        shadowLayers: [
          {
            color: "#878a00",
            blur: 12,
            offsetX: 5,
            offsetY: -5,
            opacity: 1,
            offset: 39,
            angle: -30,
          },
        ],
      },
    ),
    timer: textLayer(
      "timer",
      "Timer",
      "20",
      { x: 258, y: 534 },
      { width: 180, height: 110 },
      23,
      78,
      {
        minFontSize: 28,
        shadowLayers: [
          { color: "#000000", blur: 8, offsetX: 3, offsetY: -3, opacity: 0.55 },
        ],
      },
    ),
    tips: textLayer(
      "tips",
      "Tips",
      "Show Peace Sign to Start",
      { x: 0, y: 72 },
      { width: 620, height: 220 },
      21,
      100,
      { minFontSize: 16 },
    ),
    challengeResult: {
      ...textLayer(
        "challengeResult",
        "Challenge results",
        "Challenge Failed",
        { x: 0, y: 74.4 },
        { width: 620, height: 220 },
        22,
        210,
        { minFontSize: 32 },
      ),
      visible: false,
    },
  },
};
