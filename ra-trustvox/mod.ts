import { PreviewContainer } from "../utils/preview.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";
import { type App, type AppContext as AC } from "@deco/deco";
export interface State {
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
 * @logo https://raw.githubusercontent.com/trustvox/deco-apps/enhancement/trustvox-app/ra-trustvox/ra-trustvox.png
 */
export default function RATrustvox(state: State): App<Manifest, State> {
  return { manifest, state };
}
export type AppContext = AC<ReturnType<typeof RATrustvox>>;
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "RA Trustvox",
      owner: "deco.cx",
      description: "RA trustvox reviews.",
      logo:
        "https://raw.githubusercontent.com/trustvox/deco-apps/enhancement/trustvox-app/ra-trustvox/ra-trustvox.png",
      images: [],
      tabs: [],
    },
  };
};
