import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";
import { UnsplashClient } from "./utils/client.ts";

export interface State {
  unsplashClient: UnsplashClient;
}

interface Props {
  /**
   * @description Unsplash API access key
   */
  accessKey: Secret | string;
}

/**
 * @title Unsplash
 * @name Unsplash
 * @description Integration with the Unsplash API for searching and displaying images.
 * @category Media
 * @logo https://logowik.com/content/uploads/images/unsplash8609.jpg
 */
export default function Unsplash(props: Props): App<Manifest, State> {
  const { accessKey } = props;
  const unsplash = new UnsplashClient(
    typeof accessKey === "string" ? accessKey : accessKey.get() || "",
  );

  return {
    state: {
      unsplashClient: unsplash,
    },
    manifest,
    dependencies: [],
  };
}

export type UnsplashApp = ReturnType<typeof Unsplash>;
export type AppContext = AC<UnsplashApp> & {
  unsplashClient: UnsplashClient;
};
