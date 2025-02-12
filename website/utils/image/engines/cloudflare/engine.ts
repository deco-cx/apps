import type { Engine } from "../../engine.ts";

export const engine: Engine = {
  name: `cloudflare`,

  resolve: (params, prefferedMediaType) => {
    const { fit, width, height, quality, src } = params;

    const format = prefferedMediaType?.replace("image/", "");

    return fetch(
      src,
      {
        cf: {
          image: { format, fit, width, height, quality },
          cacheKey: `${format}-${src}`,
          cacheEverything: true,
          cacheTtlByStatus: {
            "200-299": 15552000,
            "400-499": 10,
            "500-599": 0,
          },
        },
      } as RequestInit & { cf: unknown },
    );
  },

  // is Cloudflare worker
  accepts: () =>
    // deno-lint-ignore no-explicit-any
    typeof caches !== "undefined" && Boolean((caches as any).default),
};
