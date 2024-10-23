import { createEngine as createRemoteEngine } from "../remote/engine.ts";

export const engine = createRemoteEngine({
  name: "pass-through",
  accepts: () =>
    !Deno.env.has("IMAGES_ENGINE") ||
    Deno.env.get("IMAGES_ENGINE") === "pass-through",
  urlFromParams: ({ src }) => new URL(src),
});
