import type { ListItem, ProductDetailsPage } from "../../../commerce/types.ts";
import { STALE as DecoStale } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { URL_KEY } from "../../utils/constants.ts";
import stringifySearchCriteria from "../../utils/stringifySearchCriteria.ts";
import { toBreadcrumbList, toProduct, toSeo } from "../../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  isBreadcrumbProductName?: boolean;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  return `${req.url}${props.isBreadcrumbProductName}-PDP-products-render-info`;
};

/**
 * @title Magento Integration - Product Details Page
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { slug, isBreadcrumbProductName = false } = props;
  const {
    clientAdmin,
    site,
    storeId,
    currencyCode = "",
    imagesUrl,
    minInstallmentValue,
    maxInstallments,
    enableCache,
  } = ctx;
  const STALE = enableCache ? DecoStale : undefined;

  if (!slug) {
    return null;
  }

  const getProduct = async (slug: string) => {
    const searchCriteria = {
      filterGroups: [
        {
          filters: [{ field: URL_KEY, value: slug }],
        },
      ],
    };

    const queryParams = {
      site,
      currencyCode,
      storeId,
      ...stringifySearchCriteria(searchCriteria),
    };

    const itemSku = await clientAdmin["GET /rest/:site/V1/products"](
      {
        ...queryParams,
      },
      STALE,
    ).then((res) => res.json());
    if (!itemSku.items.length) return null;

    const [{ items }, stockInfoAndImages] = await Promise.all([
      clientAdmin["GET /rest/:site/V1/products-render-info"](
        queryParams,
        STALE,
      ).then((res) => res.json()),
      clientAdmin["GET /rest/:site/V1/products/:sku"](
        {
          sku: itemSku.items[0].sku,
          site,
          storeId: storeId,
          currencyCode: currencyCode,
        },
        STALE,
      ).then((res) => res.json()),
    ]);

    return {
      ...items[0],
      sku: itemSku.items[0].sku,
      custom_attributes: itemSku.items[0].custom_attributes,
      extension_attributes: {
        ...items[0].extension_attributes,
        ...stockInfoAndImages.extension_attributes,
        ...itemSku.items[0].extension_attributes,
      },
      media_gallery_entries: stockInfoAndImages.media_gallery_entries,
    };
  };

  const getCategoryNames = async (categoryLinks: { category_id: string }[]) => {
    const getCategoryName = async (categoryId: string) => {
      return await clientAdmin["GET /rest/:site/V1/categories/:categoryId"](
        {
          site,
          categoryId,
          fields: "name,position",
        },
        STALE,
      ).then((res) => res.json());
    };

    const categoryNamePromises = categoryLinks.map((category) =>
      getCategoryName(category.category_id)
    );
    return (await Promise.all(categoryNamePromises)).filter(Boolean);
  };

  const productMagento = await getProduct(slug);
  if (!productMagento) {
    console.error("product not found");
    return null;
  }

  const categoryLinks = productMagento.extension_attributes?.category_links;

  const product = toProduct({
    product: productMagento,
    options: { imagesUrl, minInstallmentValue, maxInstallments },
  });

  const itemListElement = toBreadcrumbList(
    isBreadcrumbProductName ? [] : await getCategoryNames(categoryLinks),
    isBreadcrumbProductName,
    product,
    url,
  );

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: itemListElement as ListItem<string>[],
      numberOfItems: itemListElement.length,
    },
    product,
    seo: toSeo(productMagento.custom_attributes, product.url ?? ""),
  };
}

export default loader;
