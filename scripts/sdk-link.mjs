import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_SDK_DIR = path.resolve(repoRoot, "..", "vincentt-xr-sdk");

export const resolveSdkLinks = (value) => {
  if (!value) return undefined;
  const sdkRoot = value === "1" ? DEFAULT_SDK_DIR : path.resolve(value);
  return {
    main: path.join(sdkRoot, "dist", "main.js"),
  };
};

export const formatSdkLinks = (value) => resolveSdkLinks(value) ?? null;
