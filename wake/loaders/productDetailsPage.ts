import type { Product, ProductDetailsPage } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { MAXIMUM_REQUEST_QUANTITY } from "../utils/getVariations.ts";
import { GetBuyList, GetProduct } from "../utils/graphql/queries.ts";
import {
  BuyListQuery,
  BuyListQueryVariables,
  GetProductQuery,
  GetProductQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { parseSlug, toBreadcrumbList, toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  buyTogether?: boolean;
  includeSameParent?: boolean;
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
  const { slug, buyTogether, includeSameParent } = props;
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  if (!slug) return null;

  const variantId = Number(url.searchParams.get("skuId")) || null;
  const { id: productId } = parseSlug(slug);

  if (!productId) {
    throw new Error("Missing product id");
  }

  const { buyList: wakeBuyList } = await storefront.query<
    BuyListQuery,
    BuyListQueryVariables
  >({
    variables: { id: productId },
    ...GetBuyList,
  }, {
    headers,
  });

  const buyListProducts = await Promise.all(
    wakeBuyList?.buyListProducts?.map(async (
      buyListProduct,
    ) => {
      if (!buyListProduct) return;

      const { productId, includeSameParent, quantity } = buyListProduct;

      const buyListProductPage = await ctx.invoke.wake.loaders
        .productDetailsPage({
          // 'slug' its just to fit the parse function of loader
          slug: `slug-${productId}`,
          includeSameParent,
        });

      if (!buyListProductPage) return;

      buyListProductPage.product.additionalProperty?.push({
        "@type": "PropertyValue",
        name: "SuggestedQuantity",
        value: String(quantity),
        alternateName: "Buy List Suggested Quantity",
      });

      return buyListProductPage.product;
    }) ?? [],
  ).then((maybeProductList) =>
    maybeProductList.filter((node): node is Product => Boolean(node))
  );

  const { product: wakeProduct } = await storefront.query<
    GetProductQuery,
    GetProductQueryVariables
  >({
    variables: { productId, includeParentIdVariants: includeSameParent },
    ...GetProduct,
  }, {
    headers,
  });

  const wakeProductOrBuyList = wakeProduct || wakeBuyList;

  if (!wakeProductOrBuyList) {
    return null;
  }

  const variantsItems = await ctx.invoke.wake.loaders.productList({
    first: MAXIMUM_REQUEST_QUANTITY,
    sortDirection: "ASC",
    sortKey: "RANDOM",
    filters: { productId: [productId] },
  }) ?? [];

  const buyTogetherItens =
    buyTogether && !!wakeProductOrBuyList.buyTogether?.length
      ? await ctx.invoke.wake.loaders.productList({
        first: MAXIMUM_REQUEST_QUANTITY,
        sortDirection: "ASC",
        sortKey: "RANDOM",
        filters: {
          productId: wakeProductOrBuyList.buyTogether?.map((bt) =>
            bt!.productId
          ),
          mainVariant: true,
        },
        getVariations: true,
      }) ?? []
      : [];

  const product = toProduct(
    wakeProductOrBuyList,
    { base: url },
    variantsItems,
    variantId,
  );
  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(wakeProductOrBuyList.breadcrumbs ?? [], {
      base: url,
    }, product),
    product: {
      ...product,
      isAccessoryOrSparePartFor: buyListProducts,
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
      title: wakeProductOrBuyList.productName ?? "",
      description:
        wakeProductOrBuyList.seo?.find((m) => m?.name === "description")
          ?.content ?? "",
    },
  };
}

export default loader;
