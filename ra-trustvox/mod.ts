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

/**
 * @title RA Trustvox
 * @description RA trustvox reviews.
 * @category Review
 * @logo https://site.trustvox.com.br/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Fsite-trustvox%2Fico_trustvox_82c48cf982%2Fico_trustvox_82c48cf982.png&w=48&q=75
 */
export default function RATrustvox(
  state: Props,
): App<Manifest, Props> {
  return { manifest, state };
}

export type AppContext = AC<ReturnType<typeof App>>;
