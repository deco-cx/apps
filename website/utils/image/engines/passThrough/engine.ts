import { env } from "../../../../../compat/runtime/mod.ts";
import { createEngine as createRemoteEngine } from "../remote/engine.ts";

export const engine = createRemoteEngine({
  name: "pass-through",
  accepts: () =>
    !env.has("IMAGES_ENGINE") ||
    env.get("IMAGES_ENGINE") === "pass-through",
  urlFromParams: ({ src }) => new URL(src),
});
