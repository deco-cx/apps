import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { state } from '../mod.ts'

declare global {
  interface Window {
    _trustvox_colt: Array<
      [string, string | number | Array<string | undefined> | undefined]
    >;
  }
}

export default function TrustvoxStoreReviewsCarousel() {
  const { storeId, numberOfReviewsInStoreCarousel, enableStaging = false } = state 
  const scriptUrl = enableStaging
    ? "https://storage.googleapis.com/trustvox-colt-staging/colt.min.js"
    : "https://colt.trustvox.com.br/colt.min.js";

    function setupTrustvoxStoreReviewsCarousel(
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
            setupTrustvoxStoreReviewsCarousel,
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