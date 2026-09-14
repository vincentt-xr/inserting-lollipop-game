import { useMemo } from "react";
import {
  LayerPanel,
  ScreenImageSettingsPanel,
  ScreenTextSettingsPanel,
  type LayerNode,
} from "@vincentt-sdks/xr-sdk/debug-ui";

import type {
  LollipopLayerId,
  LollipopLayerSettings,
  LollipopSettings,
} from "./settings";

const layerToNode = (layer: LollipopLayerSettings): LayerNode => ({
  id: layer.id,
  label: layer.label,
  type: layer.kind === "image" ? "ScreenImage" : "ScreenText",
  domain: "screen2d",
  enabled: layer.enabled,
  visible: layer.visible,
  locked: layer.locked,
  renderOrder: layer.renderOrder,
});

export const LollipopDebugPanels = ({
  settings,
  selectedLayerId,
  onSelectLayer,
  onChange,
}: {
  settings: LollipopSettings;
  selectedLayerId: LollipopLayerId;
  onSelectLayer: (id: LollipopLayerId) => void;
  onChange: (next: LollipopSettings) => void;
}) => {
  const layers = useMemo(
    () =>
      Object.values(settings.layers).sort(
        (a, b) => b.renderOrder - a.renderOrder,
      ),
    [settings.layers],
  );
  const selectedLayer = settings.layers[selectedLayerId];

  const updateLayer = (
    id: string,
    updater: (layer: LollipopLayerSettings) => LollipopLayerSettings,
  ) => {
    const layerId = id as LollipopLayerId;
    onChange({
      ...settings,
      layers: {
        ...settings.layers,
        [layerId]: updater(settings.layers[layerId]),
      },
    });
  };

  const updateSelectedLayer = (next: LollipopLayerSettings) => {
    onChange({
      ...settings,
      layers: {
        ...settings.layers,
        [selectedLayerId]: next,
      },
    });
  };

  return (
    <>
      <LayerPanel
        layers={layers.map(layerToNode)}
        selectedLayerId={selectedLayerId}
        onSelectLayer={(id) => onSelectLayer(id as LollipopLayerId)}
        onToggleVisible={(id, visible) =>
          updateLayer(id, (layer) => ({ ...layer, visible }))
        }
        onToggleEnabled={(id, enabled) =>
          updateLayer(id, (layer) => ({ ...layer, enabled }))
        }
        onToggleLocked={(id, locked) =>
          updateLayer(id, (layer) => ({ ...layer, locked }))
        }
        onReorder={(nextLayers) => {
          const next = { ...settings.layers };
          nextLayers.forEach((layer) => {
            const id = layer.id as LollipopLayerId;
            next[id] = { ...next[id], renderOrder: layer.renderOrder };
          });
          onChange({ ...settings, layers: next });
        }}
      />
      {selectedLayer.kind === "image" && selectedLayer.image ? (
        <ScreenImageSettingsPanel
          value={selectedLayer.image}
          onChange={(image) => updateSelectedLayer({ ...selectedLayer, image })}
          copyLabel={selectedLayer.id}
        />
      ) : null}
      {selectedLayer.kind === "text" && selectedLayer.text ? (
        <ScreenTextSettingsPanel
          value={selectedLayer.text}
          onChange={(text) => updateSelectedLayer({ ...selectedLayer, text })}
          copyLabel={selectedLayer.id}
        />
      ) : null}
    </>
  );
};
