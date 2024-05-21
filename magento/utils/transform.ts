import {
  AggregateOffer,
  Filter,
  ImageObject,
  ListItem,
  Offer,
  PageInfo,
  Product,
  ProductListingPage,
  PropertyValue,
  Seo,
  SortOption,
  FilterToggleValue,
} from "../../commerce/types.ts";
import {
  CustomAttribute,
  MagentoCategory,
  MagentoProduct,
} from "./client/types.ts";
import {
  CategoryGraphQL,
  ProductImage,
  ProductPLPGraphQL,
  SearchResultPageInfo as PageInfoGraphQL,
  SortFields as SortFieldsGraphQL,
  Aggregation as AggregationGraphQL,
  AggregationOption as AggregationOptGraphQL,
  SimpleCategoryGraphQL,
  ProductFilterInput,
} from "./clientGraphql/types.ts";
import { ProductPrice } from "./clientGraphql/types.ts";
import { SimpleProductGraphQL, PriceRange } from "./clientGraphql/types.ts";
import { IN_STOCK, OUT_OF_STOCK, SORT_OPTIONS_ORDER } from "./constants.ts";

export const toProduct = ({
  product,
  options,
}: {
  product: MagentoProduct;
  options: { currencyCode?: string; imagesUrl?: string };
}): Product => {
  const offers = toOffer(product);
  const sku = product.sku;
  const productID = product.id.toString();
  const productPrice = product.price_info;

  const additionalProperty: PropertyValue[] = product.custom_attributes?.map(
    (attr) => ({
      "@type": "PropertyValue",
      name: attr.attribute_code,
      value: String(attr.value),
    })
  );

  return {
    "@type": "Product",
    productID,
    sku,
    url: product.url,
    name: product.name,
    gtin: sku,
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: productID,
      url: product.url,
      name: product.name,
      model: "",
      additionalProperty: additionalProperty,
      hasVariant: [
        {
          "@type": "Product",
          productID,
          sku,
          url: product.url,
          name: product.name,
          gtin: sku,
          offers: {
            "@type": "AggregateOffer",
            highPrice: productPrice?.max_price ?? product.price!,
            lowPrice: productPrice?.minimal_price ?? product.price!,
            offerCount: offers.length,
            offers: offers,
          },
        },
      ],
    },
    additionalProperty: additionalProperty,
    image: toImages(product, options.imagesUrl ?? ""),
    offers: {
      "@type": "AggregateOffer",
      highPrice: productPrice?.max_price ?? product.price!,
      lowPrice: productPrice?.minimal_price ?? product.price!,
      offerCount: offers.length,
      offers: offers,
    },
  };
};

export const toOffer = ({
  price_info,
  extension_attributes,
  sku,
  currency_code,
}: MagentoProduct): Offer[] => {
  if (!price_info) {
    return [];
  }
  const { final_price } = price_info;
  const { stock_item } = extension_attributes;

  const offer: Offer = {
    "@type": "Offer",
    availability: stock_item?.is_in_stock ? IN_STOCK : OUT_OF_STOCK,
    inventoryLevel: {
      value: stock_item?.qty ?? 0,
    },
    itemCondition: "https://schema.org/NewCondition",
    price: final_price,
    priceCurrency: currency_code,
    priceSpecification: [],
    sku: sku,
  };
  return [offer];
};

export const toImages = (product: MagentoProduct, imageUrl: string) => {
  if (imageUrl) {
    return product.media_gallery_entries?.map((img) => ({
      "@type": "ImageObject" as const,
      encodingFormat: "image",
      alternateName: `${img.file}`,
      url: `${toURL(imageUrl)}${img.file}`,
    }));
  }

  return product.images?.map((img) => ({
    "@type": "ImageObject" as const,
    encodingFormat: "image",
    alternateName: `${img.label}`,
    url: `${img.url}`,
  }));
};

export const toURL = (src: string) =>
  src.startsWith("//") ? `https:${src}` : src;

export const toBreadcrumbList = (
  categories: (MagentoCategory | null)[],
  isBreadcrumbProductName: boolean,
  product: Product,
  url: URL
) => {
  if (isBreadcrumbProductName && categories?.length === 0) {
    return [
      {
        "@type": "ListItem",
        name: product.name,
        position: 1,
        item: new URL(`/${product.name}`, url).href,
      },
    ];
  }

  const itemListElement = categories
    .map((category) => {
      if (!category || !category.name || !category.position) {
        return null;
      }
      return {
        "@type": "ListItem",
        name: category?.name,
        position: category?.position,
        item: new URL(`/${category?.name}`, url).href,
      };
    })
    .filter(Boolean) as ListItem<string>[];

  return itemListElement;
};

export const toSeo = (
  customAttributes: CustomAttribute[],
  productURL: string
): Seo => {
  const findAttribute = (attrCode: string): string => {
    const attribute = customAttributes.find(
      (attr) => attr.attribute_code === attrCode
    );
    if (!attribute) return "";
    if (Array.isArray(attribute.value)) {
      return attribute.value.join(", ");
    }
    return attribute.value;
  };

  const title = findAttribute("title");
  const metaTitle = findAttribute("meta_title");
  const metaDescription = findAttribute("meta_description");

  return {
    title: title ?? metaTitle ?? "",
    description: metaDescription ?? "",
    canonical: productURL,
  };
};

export const toProductGraphQL = (
  {
    sku,
    uid,
    canonical_url,
    url_key,
    name,
    media_gallery,
    price_range,
    stock_status,
    only_x_left_in_stock,
  }: SimpleProductGraphQL,
  originURL: URL,
  imagesQtd: number
): Product => {
  const aggregateOffer = toAggOfferGraphQL(
    price_range,
    stock_status === "IN_STOCK",
    only_x_left_in_stock
  );
  const url = new URL(canonical_url ?? url_key, originURL.origin).href;

  return {
    "@type": "Product",
    productID: uid,
    sku,
    url,
    name: name,
    gtin: sku,
    image: media_gallery
      .sort((a, b) => a.position - b.position)
      .reduce<ImageObject[]>((acc, media) => {
        if (acc.length === imagesQtd) {
          return acc;
        }
        return [...acc, toImageGraphQL(media, name)];
      }, []),
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: uid,
      url,
      name: name.trim(),
      additionalProperty: [],
      hasVariant: [
        {
          "@type": "Product",
          productID: uid,
          sku,
          url,
          name: name,
          gtin: sku,
          offers: aggregateOffer,
        },
      ],
    },
    additionalProperty: [],
    offers: aggregateOffer,
  };
};

export const toImageGraphQL = (
  media: ProductImage,
  name: string
): ImageObject => ({
  "@type": "ImageObject" as const,
  encodingFormat: "image",
  alternateName: media.label ?? name,
  url: media.url,
});

export const toAggOfferGraphQL = (
  { maximum_price, minimum_price }: PriceRange,
  inStock: boolean,
  stockLeft?: number
): AggregateOffer => ({
  "@type": "AggregateOffer",
  highPrice: maximum_price.regular_price.value,
  lowPrice: minimum_price.final_price.value,
  offerCount: 1,
  offers: [toOfferGraphQL(minimum_price, inStock, stockLeft)],
});

export const toOfferGraphQL = (
  minimum_price: ProductPrice,
  inStock: boolean,
  stockLeft?: number
): Offer => ({
  "@type": "Offer",
  availability: inStock ? IN_STOCK : OUT_OF_STOCK,
  inventoryLevel: {
    value: stockLeft ?? inStock ? 999 : 0,
  },
  itemCondition: "https://schema.org/NewCondition",
  price: minimum_price.final_price.value,
  priceCurrency: minimum_price.final_price.currency ?? "BRL",
  priceSpecification: [],
});

export const toProductListingPageGraphQL = (
  { products }: ProductPLPGraphQL,
  { categories }: CategoryGraphQL,
  originURL: URL,
  imagesQtd: number,
  appliedFilters?: ProductFilterInput
): ProductListingPage => {
  const category = categories.items[0];
  const pagination = products.page_info;
  const listElements = toItemElement(category, originURL);

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      numberOfItems: listElements.length,
      itemListElement: listElements,
      image: category.image
        ? [
            {
              "@type": "ImageObject" as const,
              url: category.image,
              alternateName: category.name,
            },
          ]
        : undefined,
    },
    filters: toFilters(products.aggregations, originURL, appliedFilters),
    products: products.items.map((p) =>
      toProductGraphQL(p, originURL, imagesQtd)
    ),
    pageInfo: toPageInfo(pagination, products.total_count, originURL),
    sortOptions: toSortOptions(products.sort_fields),
    seo: {
      title: category.meta_title ?? `${category.name}`,
      description: category.meta_description ?? "",
      canonical: "",
    },
  };
};

const toItemElement = (
  category: SimpleCategoryGraphQL,
  url: URL
): ListItem[] => {
  const { pathname, origin } = url;
  const fromBreadcrumbs = category?.breadcrumbs?.map<ListItem>((item, i) => {
    const urlKey = item.category_url_key ?? item.category_url_path!;
    const position = pathname.indexOf(urlKey);
    return {
      "@type": "ListItem",
      item: item.category_name!,
      position: i + 1,
      url: new URL(pathname.substring(0, position + urlKey.length), origin)
        .href,
    };
  });

  const fromCategory: ListItem = {
    "@type": "ListItem",
    item: category.name,
    position: (fromBreadcrumbs?.length ?? 0) + 1,
  };

  return fromBreadcrumbs ? [...fromBreadcrumbs, fromCategory] : [fromCategory];
};

const toFilters = (
  aggregations: Required<AggregationGraphQL>[],
  url: URL,
  appliedFilters?: ProductFilterInput
): Filter[] =>
  aggregations.reduce<Filter[]>((acc, agg) => {
    if (agg.position === null) {
      return acc;
    }

    return [
      ...acc,
      {
        "@type": "FilterToggle",
        label: agg.label,
        key: agg.attribute_code,
        values: agg.options.map((opt) => toFilterValues(opt, agg.attribute_code, url, appliedFilters)),
        quantity: agg.count,
      },
    ];
  }, []);

const toFilterValues = (
  option: AggregationOptGraphQL,
  attributeCode: string,
  url: URL,
  _appliedFilters?: ProductFilterInput
): FilterToggleValue => {
  const a = url;
  a.searchParams.set(attributeCode, option.value);
  return {
    quantity: option.count,
    label: option.label,
    value: option.value,
    selected: false,
    url: a.href,
  };
};

const toSortOptions = ({ options }: SortFieldsGraphQL): SortOption[] =>
  SORT_OPTIONS_ORDER.reduce<SortOption[]>((acc, opt) => {
    const option = options.find((v) => v.value === opt);
    if (!option) {
      return acc;
    }
    return [...acc, option];
  }, []);

const toPageInfo = (
  { current_page, page_size, total_pages }: PageInfoGraphQL,
  total: number,
  url: URL
): PageInfo => {
  const hasNextPage = current_page < total_pages;
  const hasPrevPage = current_page > 1;
  const params = url.searchParams;
  const nextPage = new URLSearchParams(params);
  const previousPage = new URLSearchParams(params);

  if (hasNextPage) {
    nextPage.set("p", (current_page + 1).toString());
  }

  if (hasPrevPage) {
    previousPage.set("p", (current_page - 1).toString());
  }

  return {
    currentPage: current_page,
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPrevPage ? `?${previousPage}` : undefined,
    recordPerPage: page_size,
    records: total,
  };
};
