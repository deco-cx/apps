import { ProductDetailsPage } from "../../commerce/types.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

declare global {
  interface Window {
    _trustvox: Array<
      [string, string | number | Array<string | undefined> | undefined]
    >;
  }
}

export interface Props {
  page: ProductDetailsPage | null;

  /**
   * @ignore
   */
  storeId: string;

  /**
   * @ignore
   */
  enableStaging?: boolean;
}

export default function ProductReviews(props: Props) {
  const { storeId, enableStaging = false } = props;
  const scriptUrl = enableStaging
    ? "https://static.trustvox.com.br/trustvox-sincero-staging/sincero.js"
    : "https://static.trustvox.com.br/sincero/sincero.js";

  const { page } = props;
  const productId = page?.product?.productID;
  const productName = page?.product?.name;
  const productImage = page?.product?.image?.[0]?.url;

  function setupProductReviews(
    storeId: string,
    productId?: string,
    productName?: string,
    productImage?: string,
  ) {
    globalThis.window._trustvox = [];
    globalThis.window._trustvox.push(["_storeId", storeId]);
    globalThis.window._trustvox.push(["_productId", productId]);
    globalThis.window._trustvox.push(["_productName", productName]);
    globalThis.window._trustvox.push(["_productPhotos", [productImage]]);
  }

  return (
    <>
      <script
        defer
        src={scriptAsDataURI(
          setupProductReviews,
          storeId,
          productId,
          productName,
          productImage,
        )}
      />
      <script
        defer
        type="text/javascript"
        src={scriptUrl}
      />

      <div id="trustvox-reviews" class="w-full mx-auto flex items-center justify-center">
        <div id="_trustvox_widget" />
      </div>
    </>
  );
}
