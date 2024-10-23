import type { AnalyticsItem, BreadcrumbList, Product } from "../types.ts";

export const mapCategoriesToAnalyticsCategories = (
  categories: string[],
): Record<`item_category${number | ""}`, string> => {
  return categories.slice(0, 5).reduce(
    (result, category, index) => {
      result[`item_category${index === 0 ? "" : index + 1}`] = category;
      return result;
    },
    {} as Record<`item_category${number | ""}`, string>,
  );
};

export const mapProductCategoryToAnalyticsCategories = (category: string) => {
  return category.split(">").reduce(
    (result, category, index) => {
      result[`item_category${index === 0 ? "" : index + 1}`] = category.trim();
      return result;
    },
    {} as Record<`item_category${number | ""}`, string>,
  );
};

export const mapProductToAnalyticsItem = (
  {
    product,
    breadcrumbList,
    price,
    listPrice,
    index = 0,
    quantity = 1,
    coupon = "",
  }: {
    product: Product;
    breadcrumbList?: BreadcrumbList;
    price?: number;
    listPrice?: number;
    index?: number;
    quantity?: number;
    coupon?: string;
  },
): AnalyticsItem => {
  const { name, productID, inProductGroupWithID, isVariantOf, url } = product;
  const categories = breadcrumbList?.itemListElement
    ? mapCategoriesToAnalyticsCategories(
      breadcrumbList?.itemListElement.map(({ name: _name }) => _name ?? "")
        .filter(Boolean) ??
        [],
    )
    : mapProductCategoryToAnalyticsCategories(product.category ?? "");

  return {
    item_id: productID,
    item_group_id: inProductGroupWithID,
    quantity,
    coupon,
    price,
    index,
    discount: Number((price && listPrice ? listPrice - price : 0).toFixed(2)),
    item_name: isVariantOf?.name ?? name ?? "",
    item_variant: name,
    item_brand: product.brand?.name ?? "",
    item_url: url,
    ...categories,
  };
};
