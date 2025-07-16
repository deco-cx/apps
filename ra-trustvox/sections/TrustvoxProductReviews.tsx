import { ProductDetailsPage } from "../../commerce/types.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { AppContext } from "../mod.ts";
import { type SectionProps } from "@deco/deco";
declare global {
  interface Window {
    _trustvox: Array<
      [string, string | number | Array<string | undefined> | undefined]
    >;
  }
}
export interface Props {
  page: ProductDetailsPage | null;
  enableVTEX?: boolean;
}
export default function TrustvoxProductReviews(
  props: Props & SectionProps<typeof loader>
) {
  const { page, storeId, enableStaging, enableVTEX } = props;
  const scriptUrl = enableStaging
    ? "https://static.trustvox.com.br/trustvox-sincero-staging/sincero.js"
    : "https://static.trustvox.com.br/sincero/sincero.js";
  const VTEX_PRODUCT_ID = page?.product?.inProductGroupWithID;
  const VTEX_PRODUCT_NAME = page?.product?.alternateName;
  const productId = page?.product?.productID;
  const productName = page?.product?.name;
  const productImage = page?.product?.image?.[0]?.url;

  const usedProductId = enableVTEX ? VTEX_PRODUCT_ID : productId;
  const usedProductName = enableVTEX ? VTEX_PRODUCT_NAME : productName;

  function setupTrustvoxProductReviews(
    storeId: string,
    productId?: string,
    productName?: string,
    productImage?: string
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
          setupTrustvoxProductReviews,
          storeId,
          usedProductId,
          usedProductName,
          productImage
        )}
      />
      <script defer type="text/javascript" src={scriptUrl} />

      <div
        id="trustvox-reviews"
        class="w-full mx-auto flex items-center justify-center"
      >
        <div id="_trustvox_widget" />
      </div>
    </>
  );
}
export const loader = (props: Props, _req: Request, ctx: AppContext) => {
  return {
    ...props,
    storeId: ctx.storeId,
    enableStaging: ctx.enableStaging,
  };
};
