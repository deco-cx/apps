import type { App, FnContext } from "deco/mod.ts";

import { createHttpClient } from "../utils/http.ts";
import { PowerReviews } from "./utils/client.ts";
import { fetchSafe } from "../utils/fetch.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title App Key
   */
  appKey: string;
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

export default function App(state: Props): App<Manifest, State> {
  const api = createHttpClient<PowerReviews>({
    base: `https://readservices-b2c.powerreviews.com`,
    fetcher: fetchSafe,
    headers: new Headers({
      Authorization: state.appKey,
    }),
  });

  const apiWrite = createHttpClient<PowerReviews>({
    base: `https://writeservices.powerreviews.com`,
    fetcher: fetchSafe,
    headers: new Headers({
      Authorization: state.appKey,
    }),
  });

  return {
    state: { ...state, api, apiWrite },
    manifest: {
      ...manifest,
      sections: {
        ...manifest.sections,
        "power-reviews/sections/WriteReviewForm.tsx": {
          ...manifest.sections["power-reviews/sections/WriteReviewForm.tsx"],
          default: () =>
            manifest.sections["power-reviews/sections/WriteReviewForm.tsx"]
              .default({
                ...state,
              }),
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
