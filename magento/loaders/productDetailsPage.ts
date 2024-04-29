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
  const url = new URL(req.url);
  const { slug } = props;
  const { clientGuest, clientAdmin, site, storeId, currencyCode = "" } = ctx;

  if (!slug) {
    return null;
  }

  const getProduct = async (slug: string) => {
    try {
      const { items } = await clientAdmin["GET /rest/:site/V1/products"]({
        site,
        currencyCode: currencyCode,
        [KEY_FIELD]: URL_KEY,
        [KEY_VALUE]: slug,
      }).then((res) => res.json());
      console.log(items[0].sku);
      console.log(await clientGuest
        ["GET /rest/:site/V1/products/:sku"]({
          site,
          sku: items[0].sku,
          storeId: storeId,
          currencyCode: currencyCode,
          fields: "extension_attributes[stock_item[item_id,qty]]",
        }).then((res) => res.json()));
      
      const stockInfo = await clientGuest
        ["GET /rest/:site/V1/products/:sku"]({
          sku: items[0].sku,
          site,
          storeId: storeId,
          currencyCode: currencyCode,
          fields: "image,currency_code,url,extension_attributes[stock_item[item_id,qty]]",
        }).then((res) => res.json());
        console.log({stockInfo});
        return {
          ...items[0],
          ...stockInfo
        };
    } catch (_error) {
      return null;
    }
  };

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

  const productMagento = await getProduct(slug);

  // 404: product not found
  if (!productMagento) {
    console.log("product not found");
    return null;
  }

  const categoryLinks = productMagento.extension_attributes?.category_links;

  const product = toProduct({
    ...productMagento,
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
