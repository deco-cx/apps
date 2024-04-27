import type { ListItem, ProductDetailsPage } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { KEY_FIELD, KEY_VALUE } from "../utils/constants.ts";
import { parseSlug, toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  currencyCode?: string;
}

/**
 * @title VNDA Integration
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  console.log("loader start");
  const url = new URL(req.url);
  const { slug, currencyCode = "" } = props;
  const { clientGuest, clientAdmin } = ctx;

  const getMaybeProduct = async (slug: string) => {
    try {
      console.log(
        await clientAdmin["GET /rest/granado/V1/products"]({
          currencyCode: currencyCode,
          [KEY_FIELD]: "url_key",
          [KEY_VALUE]: "kit-lata-sabonetes-em-barra-rosmarino",
        }).then((res) => res.json()),
      );
      return await clientAdmin["GET /rest/granado/V1/products"]({
        currencyCode: currencyCode,
        [KEY_FIELD]: "url_key",
        [KEY_VALUE]: "kit-lata-sabonetes-em-barra-rosmarino",
      }).then((res) => res.json());
    } catch (error) {
      return error;
    }
  };

  const getProductPrice = async (sku: string | null) => {
    if (!sku) {
      return null;
    }
    try {
      console.log(
        await clientGuest["GET /rest/granado/V1/products-render-info"]({
          [KEY_FIELD]: "sku",
          [KEY_VALUE]: sku,
          storeId: 21,
          currencyCode: currencyCode,
          field: "items[price_info]",
        }).then((res) => res.json()),
      );
      return await clientGuest["GET /rest/granado/V1/products-render-info"]({
        [KEY_FIELD]: "sku",
        [KEY_VALUE]: sku,
        storeId: 21,
        currencyCode: currencyCode,
        field: "items[price_info]",
      }).then((res) => res.json());
    } catch (error) {
      return error;
    }
  };
  console.log("call getMaybeProduct");
  const productMagento = await getMaybeProduct(slug);
  console.log(productMagento[0].sku);

  // 404: product not found
  if (!productMagento) {
    console.log("product not found");
    return null;
  }
  console.log("call getProductPrice");
  const productMagentoPrice = await getProductPrice(productMagento[0].sku);
  console.log(productMagentoPrice);

  // 404: price not found
  if (!productMagentoPrice) {
    return null;
  }

  const categoryLinks = productMagento[0].extension_attributes?.category_links;

  const product = toProduct({
    ...productMagento[0],
    ...productMagentoPrice[0],
  });

  const getCategoryName = async (categoryId: string) => {
    try {
      return await clientAdmin["GET /rest/granado/V1/categories/:categoryId"]({
        categoryId,
        fields: "name,position",
      }).then((res) => res.json());
    } catch (error) {
      return error;
    }
  };

  const categoryName = categoryLinks.map(
    (category: { category_id: string }) => {
      return getCategoryName(category.category_id);
    },
  );

  const categories = await Promise.all(categoryName);
  const itemListElement = categories.map((category) => {
    if (!category || !category.name || !category.position) {
      return null;
    }
    return {
      "@type": "ListItem",
      name: category?.name,
      position: category?.position,
      item: new URL(`/${category?.name}`, url).href,
    };
  }).filter(Boolean) as ListItem<string>[];

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    product,
    seo: {
      title: product.name ?? "",
      description: product.description ?? "",
      canonical: new URL(`/${product.name}`, url).href,
    },
  };
}

export default loader;
