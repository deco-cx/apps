import { scriptAsDataURI } from "../../utils/dataURI.ts";

declare global {
  interface Window {
    _trustvox_colt: Array<
      [string, string | number | Array<string | undefined> | undefined]
    >;
  }
}

export interface Props {
  storeId: string;
  numberOfReviewsInStoreCarousel?: number
  enableStaging?: boolean;
}

export default function StoreReviewsCarousel(props: Props) {
  const { storeId, numberOfReviewsInStoreCarousel, enableStaging = false } = props 
  const scriptUrl = enableStaging
    ? "https://storage.googleapis.com/trustvox-colt-staging/colt.min.js"
    : "https://colt.trustvox.com.br/colt.min.js";

    function setupStoreReviewsCarousel(
      storeId: string,
      numberOfReviewsInStoreCarousel?: number
    ) {
      globalThis.window._trustvox_colt = [];
      globalThis.window._trustvox_colt.push(["_storeId", storeId]);
      globalThis.window._trustvox_colt.push(["_limit", numberOfReviewsInStoreCarousel]);
    }

    return (
      <>
        <script
          defer
          src={scriptAsDataURI(
            setupStoreReviewsCarousel,
            storeId,
            numberOfReviewsInStoreCarousel
          )}
        />
        <script
          defer
          type="text/javascript"
          src={scriptUrl}
        />
  
        <div id="_trustvox_colt" class="my-8" />
      </>
    );
}