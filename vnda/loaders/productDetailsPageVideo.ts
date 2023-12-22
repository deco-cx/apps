import { AppContext } from "../mod.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { ProductDetailsPage } from "../../commerce/types.ts";
import { addVideoToProduct } from "../utils/transform.ts";
import { STALE } from "../../utils/fetch.ts";

export default function productDetailsPageVideo(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductDetailsPage | null> {
  const { api } = ctx;
  return async (productDetailsPage: ProductDetailsPage | null) => {
    if (!productDetailsPage) {
      return null;
    }
    const { product } = productDetailsPage;
    const { inProductGroupWithID } = product;
    const videos = await api["GET /api/v2/products/:productId/videos"]({
      productId: inProductGroupWithID as string,
    }, STALE).then((r) => r.json()).catch(() => null);
    const productWithVideo = addVideoToProduct(product, videos);
    return {
      ...productDetailsPage,
      product: productWithVideo,
    };
  };
}
