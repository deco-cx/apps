import type { App, FnContext } from "deco/mod.ts";

import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PowerReviews } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title App Key
   */
  appKey: Secret;
  /**
   * @title Locale
   */
  locale?: string;
  /**
   * @title Merchant Id
   */
  merchantId: string;
  /**
   * @title Merchant Group
   */
  merchantGroup?: string;
}

interface State extends Props {
  api: ReturnType<typeof createHttpClient<PowerReviews>>;
  apiWrite: ReturnType<typeof createHttpClient<PowerReviews>>;
}

/**
 * @title Power Reviews
 * @description Collect more and better Ratings & Reviews and other UGC. Create UGC displays that convert. Analyze to enhance product experience and positioning.
 * @category Review
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/power-reviews/logo.png
 */
export default function App(
  { appKey, locale, merchantId, merchantGroup }: Props,
) {
  if (!appKey) throw new Error("Missing appKey");

  const stringAppKey = typeof appKey === "string"
    ? appKey
    : appKey?.get?.() ?? "";

  const api = createHttpClient<PowerReviews>({
    base: `https://readservices-b2c.powerreviews.com`,
    fetcher: fetchSafe,
    headers: new Headers({
      Authorization: stringAppKey,
    }),
  });

  const apiWrite = createHttpClient<PowerReviews>({
    base: `https://writeservices.powerreviews.com`,
    fetcher: fetchSafe,
    headers: new Headers({
      Authorization: stringAppKey,
    }),
  });

  const state = {
    appKey: stringAppKey,
    locale,
    merchantId,
    merchantGroup,
    api,
    apiWrite,
  };

  const app: App<Manifest, typeof state> = {
    state,
    manifest: {
      ...manifest,
      sections: {
        ...manifest.sections,
        "power-reviews/sections/WriteReviewForm.tsx": {
          ...manifest.sections["power-reviews/sections/WriteReviewForm.tsx"],
          default: () =>
            manifest.sections["power-reviews/sections/WriteReviewForm.tsx"]
              .default(state),
        },
        "power-reviews/sections/Question.tsx": {
          ...manifest.sections["power-reviews/sections/Question.tsx"],
          default: (props) =>
            manifest.sections["power-reviews/sections/Question.tsx"].default({
              ...state,
              ...props,
            }),
        },
      },
    },
  };

  return app;
}
