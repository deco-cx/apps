import { HttpError } from "../../../../../utils/http.ts";
import type { Engine, Params } from "../../engine.ts";
import { fetchPublicUrl } from "../../../publicUrl.ts";

/** Request headers worth forwarding to an image origin. */
export const imageRequestHeaders = (req: Request) => {
  const headers = new Headers({ accept: "image/*" });
  for (const name of ["accept", "user-agent", "referer"]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
};

type ExternalEngine = {
  name: string;
  urlFromParams: (params: Params) => URL;
  accepts: (src: string) => boolean;
  /**
   * The engine fetches `src` itself, so the URL allowlist applies to it. An
   * image service that fetches `src` on its own is not checked here.
   */
  fetchesSrc?: boolean;
};

export const createEngine = (
  external: ExternalEngine,
): Engine => ({
  ...external,

  resolve: async (params, _preferredMediaType, req, options) => {
    const url = external.urlFromParams(params);

    const response = await fetchPublicUrl(url, {
      headers: imageRequestHeaders(req),
    }, {
      allowUrl: external.fetchesSrc ? options?.allowUrl : undefined,
    });

    if (!response.ok) {
      throw new HttpError(502);
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "",
      },
    });
  },
});
