// Every picture here is a `ScreenImage` with a literal `src`, `fit` and number
// `anchors`, so the console's visual editor can swap, move and resize it. Keep
// them written out like this: a `src` or an edge read from a variable can only be
// changed in code. Motion (spin, pulse, bob, launch, orbit) lives on the
// `Pivot` groups around them, never on the images.
//
// Anchors are the authored 720 x 1280 placement divided by 360 (x) and 640 (y).
// The lollipop picture points up; flipX + flipY turns it the 180 degrees the
// game was authored with.
import type { ReactNode } from "react";
import { ScreenImage } from "@vincentt-xr/sdk";
import { useScreenSpace } from "@vincentt-xr/sdk/low-level";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Moves, turns and scales its children about a design-canvas point (720 x 1280
 * pixels, centre origin, +y up): `at` is the point the children were authored
 * around, `offset` moves them from there.
 */
export const Pivot = ({
  at,
  offset,
  rotation = 0,
  scale = 1,
  children,
}: {
  at: { x: number; y: number };
  offset?: { x: number; y: number };
  rotation?: number;
  scale?: number;
  children: ReactNode;
}) => {
  const { width, height } = useScreenSpace();
  const kx = width / 720;
  const ky = height / 1280;
  return (
    <group
      position={[(at.x + (offset?.x ?? 0)) * kx, (at.y + (offset?.y ?? 0)) * ky, 0]}
      rotation={[0, 0, rotation * DEG_TO_RAD]}
      scale={[scale, scale, 1]}
    >
      <group position={[-at.x * kx, -at.y * ky, 0]}>{children}</group>
    </group>
  );
};

export const Roulette = () => (
  <ScreenImage name="Roulette" src="/images/Disk.png" fit="contain" transparent renderOrder={18} anchors={{ left: -0.35, right: 0.35, top: 0.75, bottom: 0.05 }} />
);

export const Spiral = () => (
  <ScreenImage name="Spiral" src="/images/Spiral.png" fit="contain" transparent renderOrder={19} anchors={{ left: -0.302778, right: 0.302778, top: 0.56875, bottom: 0.228125 }} />
);

export const ActiveLollipop = ({ visible }: { visible: boolean }) => (
  <ScreenImage name="Active lollipop" src="/images/Pink lollipop.png" fit="contain" transparent flipX flipY renderOrder={16} visible={visible} anchors={{ left: -0.125, right: 0.125, top: -0.1875, bottom: -0.4375 }} />
);

/** One lollipop stuck in the wheel. Drawn once per hit, at the target spot, then moved there by its Pivot. */
export const StuckLollipop = () => (
  <ScreenImage name="Stuck lollipop" src="/images/Pink lollipop.png" fit="contain" transparent flipX flipY renderOrder={16} anchors={{ left: -0.125, right: 0.125, top: 0.225, bottom: -0.025 }} />
);

export const BottomFrame = () => (
  <ScreenImage name="Lollipop border" src="/images/Bottom frame.png" fit="contain" transparent renderOrder={24} anchors={{ left: -1, right: 1, top: -0.252, bottom: -1.04175 }} />
);

export const CandyDrops = () => (
  <ScreenImage name="Candy drops" src="/images/Candy Drops.png" fit="contain" transparent renderOrder={25} anchors={{ left: -1.002778, right: 1.002778, top: 1.072806, bottom: 0.770944 }} />
);
