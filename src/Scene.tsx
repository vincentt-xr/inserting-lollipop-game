import { VideoBackground } from "@vincentt-xr/sdk";

import { LollipopGame } from "./lollipop/LollipopGame";
import { DEFAULT_LOLLIPOP_SETTINGS } from "./lollipop/settings";

export const Scene = () => (
  <>
    <VideoBackground renderOrder={-999} />
    <LollipopGame settings={DEFAULT_LOLLIPOP_SETTINGS} />
  </>
);
