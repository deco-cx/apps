import { createEngine as createRemoteEngine } from "../remote/engine.ts";

export const engine = createRemoteEngine({
  name: "pass-through",
  accepts: () => !Deno.env.has("DECO_SITE_NAME"),
  urlFromParams: ({ src }) => new URL(src),
});
