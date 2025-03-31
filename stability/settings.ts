export type StabilityImageModelId =
  | "core"
  | "ultra"
  | "conservative"
  | "creative"
  | "fast"
  | "erase"
  | "search-and-replace"
  | "search-and-recolor"
  | "remove-background"
  | "inpaint"
  | "outpaint"
  | "replace-background-and-relight"
  | "sketch"
  | "structure"
  | "style";

export type StabilityVideoModelId = "core" | "ultra";

export type StabilityObject3DModelId = "core" | "ultra";

export interface StabilityImageSettings {
  strength?: number;
  cfgScale?: number;
  steps?: number;
  seed?: number;
  width?: number;
  height?: number;
  samples?: number;
}

export interface StabilityVideoSettings {
  cfgScale?: number;
  steps?: number;
  seed?: number;
  width?: number;
  height?: number;
  samples?: number;
  motionBucketId?: number;
}

export interface StabilityObject3DSettings {
  cfgScale?: number;
  steps?: number;
  seed?: number;
  width?: number;
  height?: number;
  samples?: number;
}
