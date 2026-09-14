declare module "@vincentt-sdks/xr-sdk/debug-ui" {
  import type { ComponentType } from "react";
  import type {
    ScreenImageSceneSettings,
    ScreenTextSceneSettings,
  } from "@vincentt-sdks/xr-sdk";

  export type LayerDomain =
    | "group"
    | "screen2d"
    | "scene3d"
    | "webgl"
    | "shader"
    | "custom";

  export type LayerNode = {
    id: string;
    domain: LayerDomain;
    type: string;
    label: string;
    enabled: boolean;
    visible: boolean;
    locked?: boolean;
    expanded?: boolean;
    renderOrder: number;
    children?: LayerNode[];
    meta?: Record<string, unknown>;
  };

  export type LayerPanelProps = {
    layers: LayerNode[];
    selectedLayerId: string;
    onSelectLayer: (id: string) => void;
    onToggleVisible: (id: string, visible: boolean) => void;
    onToggleEnabled: (id: string, enabled: boolean) => void;
    onReorder: (nextLayers: LayerNode[]) => void;
    onRename?: (id: string, label: string) => void;
    onToggleLocked?: (id: string, locked: boolean) => void;
    initialPosition?: { x: number; y: number };
  };

  export type ScreenImageSettingsPanelProps = {
    value: ScreenImageSceneSettings;
    onChange: (next: ScreenImageSceneSettings) => void;
    copyLabel?: string;
  };

  export type ScreenTextSettingsPanelProps = {
    value: ScreenTextSceneSettings;
    onChange: (next: ScreenTextSceneSettings) => void;
    copyLabel?: string;
  };

  export const LayerPanel: ComponentType<LayerPanelProps>;
  export const ScreenImageSettingsPanel: ComponentType<ScreenImageSettingsPanelProps>;
  export const ScreenTextSettingsPanel: ComponentType<ScreenTextSettingsPanelProps>;
}
