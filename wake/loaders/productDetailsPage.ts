import type { ProductDetailsPage } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { MAXIMUM_REQUEST_QUANTITY } from "../utils/getVariations.ts";
import { GetProduct } from "../utils/graphql/queries.ts";
import {
  GetProductQuery,
  GetProductQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { parseSlug, toBreadcrumbList, toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  buyTogether?: boolean;
}

/**
 * @title Wake Integration
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { slug, buyTogether } = props;
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  if (!slug) return null;

  const variantId = Number(url.searchParams.get("skuId")) || null;
  const { id: productId } = parseSlug(slug);

  if (!productId) {
    throw new Error("Missing product id");
  }

  const { product: wakeProduct } = await storefront.query<
    GetProductQuery,
    GetProductQueryVariables
  >({
    variables: { productId },
    ...GetProduct,
  }, {
    headers,
  });

  if (!wakeProduct) {
    return null;
  }

  const variantsItems = await ctx.invoke.wake.loaders.productList({
    first: MAXIMUM_REQUEST_QUANTITY,
    sortDirection: "ASC",
    sortKey: "RANDOM",
    filters: { productId: [productId] },
  }) ?? [];

  const buyTogetherItens = buyTogether && !!wakeProduct.buyTogether?.length
    ? await ctx.invoke.wake.loaders.productList({
      first: MAXIMUM_REQUEST_QUANTITY,
      sortDirection: "ASC",
      sortKey: "RANDOM",
      filters: {
        productId: wakeProduct.buyTogether.map((bt) => bt!.productId),
        mainVariant: true,
      },
      getVariations: true,
    }) ?? []
    : [];

  const product = toProduct(
    wakeProduct,
    { base: url },
    variantsItems,
    variantId,
  );
  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(wakeProduct.breadcrumbs, {
      base: url,
    }, product),
    product: {
      ...product,
      isRelatedTo: buyTogetherItens?.map(
        (buyItem) => {
          return {
            ...buyItem,
            additionalType: "BuyTogether",
          };
        },
      ) ?? [],
    },
    seo: {
      canonical: product.isVariantOf?.url ?? "",
      title: wakeProduct.productName ?? "",
      description:
        wakeProduct.seo?.find((m) => m?.name === "description")?.content ?? "",
    },
  };
}

export default loader;
