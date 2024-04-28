import type { ListItem, ProductDetailsPage } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { KEY_FIELD, KEY_VALUE, URL_KEY } from "../utils/constants.ts";
import { toProduct } from "../utils/transform.ts";

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

  if (!slug) {
    return null;
  }

  const getMaybeProduct = async (slug: string) => {
    try {
      const response = await clientAdmin["GET /rest/granado/V1/products"]({
        currencyCode: currencyCode,
        [KEY_FIELD]: URL_KEY,
        [KEY_VALUE]: slug,
      }).then((res) => res.json());
      return response.items[0];
    } catch (_error) {
      return null;
    }
  };
  const getProductPriceAndImages = async (sku: string | null) => {
    if (!sku) {
      return null;
    }
    try {
      const response = await clientGuest
        ["GET /rest/granado/V1/products-render-info"]({
          [KEY_FIELD]: "sku",
          [KEY_VALUE]: sku,
          storeId: 21,
          currencyCode: currencyCode,
          field: "items[price_info,image,currency_code,url]",
        }).then((res) => res.json());

      return {
        priceInfo: response.items[0].price_info,
        currencyCode: response.items[0].currency_code,
        images: response.items[0].images,
        url: response.items[0].url,
      };
    } catch (_error) {
      return null;
    }
  };
  const getProductStock = async (sku: string | null) => {
    if (!sku) {
      return null;
    }
    try {
      const response = await clientGuest
        ["GET /rest/granado/V1/products-render-info"]({
          [KEY_FIELD]: "sku",
          [KEY_VALUE]: sku,
          storeId: 21,
          currencyCode: currencyCode,
          field: "items[extension_attributes.stock_item]",
        }).then((res) => res.json());
      return response.items[0].extension_attributes?.stock_item;
    } catch (_error) {
      return null;
    }
  };
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

  const productInfo = await getMaybeProduct(slug);

  // 404: product not found
  if (!productInfo) {
    console.log("product not found");
    return null;
  }

  const [productPriceInfos, stock_item] = await Promise.all(
    [
      getProductPriceAndImages(productInfo.sku),
      getProductStock(productInfo.sku),
    ],
  );

  // 404: price not found
  if (!productPriceInfos) {
    return null;
  }

  const categoryLinks = productInfo.extension_attributes?.category_links;

  const product = toProduct({
    ...productInfo!,
    price_info: productPriceInfos.priceInfo,
    images: productPriceInfos.images,
    currency_code: productPriceInfos.currencyCode,
    url: productPriceInfos.url,
    extension_attributes: {
      ...productInfo.extension_attributes,
      stock_item: stock_item ?? undefined,
    },
  });

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
      canonical: product.url ?? "",
    },
  };
}

export default loader;
