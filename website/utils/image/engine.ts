import type { AllowUrl } from "../publicUrl.ts";

export interface Params {
  src: string;
  width: number;
  height: number;
  fit?: "cover" | "contain";
  quality?: number; // 0 - 100
}

export type Engine = {
  name: string;

  resolve: (
    params: Params,
    preferredMediaType: string | undefined,
    req: Request,
    options?: {
      /** Applies to every URL fetched for `src`, redirects included. */
      allowUrl?: AllowUrl;
    },
  ) => Response | Promise<Response>;

  accepts: (src: string) => boolean;
};
