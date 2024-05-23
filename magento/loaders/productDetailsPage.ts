import type { ListItem, ProductDetailsPage } from "../../commerce/types.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { URL_KEY } from "../utils/constants.ts";
import stringifySearchCriteria from "../utils/stringifySearchCriteria.ts";
import { toBreadcrumbList, toProduct, toSeo } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  isBreadcrumbProductName?: boolean;
}

/**
 * @title Magento Integration
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext
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
  } = ctx;

  if (!slug) {
    return null;
  }

  const getProduct = async (slug: string) => {
    try {
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

      const itemSku = await clientAdmin["GET /rest/:site/V1/products"]({
        ...queryParams,
      }).then((res) => res.json());

      const [{ items }, stockInfoAndImages] = await Promise.all([
        clientAdmin["GET /rest/:site/V1/products-render-info"](
          queryParams
        ).then((res) => res.json()),
        clientAdmin["GET /rest/:site/V1/products/:sku"]({
          sku: itemSku.items[0].sku,
          site,
          storeId: storeId,
          currencyCode: currencyCode,
        }).then((res) => res.json()),
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
    } catch (_error) {
      return null;
    }
  };

  const getCategoryNames = async (categoryLinks: { category_id: string }[]) => {
    const getCategoryName = async (categoryId: string) => {
      try {
        return await clientAdmin["GET /rest/:site/V1/categories/:categoryId"]({
          site,
          categoryId,
          fields: "name,position",
        }).then((res) => res.json());
      } catch (error) {
        console.error(error);
        return null;
      }
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
    url
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