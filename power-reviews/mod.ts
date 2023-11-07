import type { App, FnContext } from "deco/mod.ts";

import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import { SecretString } from "../website/loaders/secretString.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PowerReviews } from "./utils/client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title App Key
   */
  appKey: SecretString;
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

export default function App(
  { appKey, locale, merchantId, merchantGroup }: Props,
): App<Manifest, State> {
  if (!appKey) throw new Error("Missing appKey");

  const api = createHttpClient<PowerReviews>({
    base: `https://readservices-b2c.powerreviews.com`,
    fetcher: fetchSafe,
    headers: new Headers({
      Authorization: appKey,
    }),
  });

  const apiWrite = createHttpClient<PowerReviews>({
    base: `https://writeservices.powerreviews.com`,
    fetcher: fetchSafe,
    headers: new Headers({
      Authorization: appKey,
    }),
  });

  const state = {
    appKey,
    locale,
    merchantId,
    merchantGroup,
    api,
    apiWrite,
  };

  return {
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
}
