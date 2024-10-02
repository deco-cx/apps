import { ProductDetailsPage } from "../../commerce/types.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { AppContext } from "../mod.ts";
import { type SectionProps } from "@deco/deco";
declare global {
  interface Window {
    _trustvox: Array<[
      string,
      string | number | Array<string | undefined> | undefined,
    ]>;
  }
}
export interface Props {
  page: ProductDetailsPage | null;
}
export default function TrustvoxProductReviews(
  { page, storeId, enableStaging }: Props & SectionProps<typeof loader>,
) {
  const scriptUrl = enableStaging
    ? "https://static.trustvox.com.br/trustvox-sincero-staging/sincero.js"
    : "https://static.trustvox.com.br/sincero/sincero.js";
  const productId = page?.product?.productID;
  const productName = page?.product?.name;
  const productImage = page?.product?.image?.[0]?.url;
  function setupTrustvoxProductReviews(
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
          setupTrustvoxProductReviews,
          storeId,
          productId,
          productName,
          productImage,
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
export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  return {
    storeId: ctx.storeId,
    enableStaging: ctx.enableStaging,
  };
};
