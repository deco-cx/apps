import type { App, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";

export interface Props {
  /**
   * @title Store ID
   * @description Store ID available on the Trustvox dashboard.
   */
  storeId: string;

  /**
   * @title Number of reviews in store carousel.
   * @description Number of reviews that should appear in the store carousel widget.
   * @default 7
   */
  numberOfReviewsInStoreCarousel?: number;

  /**
   * @title Enable the staging environment.
   * @description When enabling the testing environment, the store id must be replaced with a store id from a Trustvox testing environment store.
   * @default false
   */
  enableStaging?: boolean;
}

export let state: Props;

/**
 * @title RA Trustvox
 * @description RA trustvox reviews.
 * @category Review
 * @logo https://raw.githubusercontent.com/trustvox/deco-apps/enhancement/trustvox-app/ra-trustvox/ra-trustvox.png
 */
export default function RATrustvox(
  props: Props,
): App<Manifest, Props> {
  state = props;

  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
