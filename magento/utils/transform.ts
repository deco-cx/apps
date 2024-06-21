import {
  AggregateOffer,
  Filter,
  FilterToggleValue,
  ImageObject,
  ListItem,
  Offer,
  PageInfo,
  Product,
  ProductListingPage,
  PropertyValue,
  Review,
  Seo,
  SortOption,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import {
  CustomAttribute,
  MagentoCategory,
  MagentoProduct,
  ReviewsAmastyAPI,
} from "./client/types.ts";
import {
  Aggregation as AggregationGraphQL,
  AggregationOption as AggregationOptGraphQL,
  CategoryGraphQL,
  CompleteProductGraphQL,
  PLPGraphQL,
  ProductImage,
  SearchResultPageInfo as PageInfoGraphQL,
  SimpleCategoryGraphQL,
  SortFields as SortFieldsGraphQL,
} from "./clientGraphql/types.ts";
import { ProductPrice } from "./clientGraphql/types.ts";
import { PriceRange, SimpleProductGraphQL } from "./clientGraphql/types.ts";
import {
  IN_STOCK,
  MAX_RATING_VALUE,
  MIN_RATING_VALUE,
  OUT_OF_STOCK,
  REMOVABLE_URL_SEARCHPARAMS,
  SORT_OPTIONS_ORDER,
} from "./constants.ts";

export const toProduct = ({
  product,
  options,
}: {
  product: MagentoProduct;
  options: {
    currencyCode?: string;
    imagesUrl?: string;
    maxInstallments: number;
    minInstallmentValue: number;
  };
}): Product => {
  const offers = toOffer(
    product,
    options.minInstallmentValue,
    options.maxInstallments,
  );
  const sku = product.sku;
  const productID = product.id.toString();
  const productPrice = product.price_info;

  const additionalProperty: PropertyValue[] = product.custom_attributes?.map(
    (attr) => ({
      "@type": "PropertyValue",
      name: attr.attribute_code,
      value: String(attr.value),
    }),
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

export const toOffer = (
  { price_info, extension_attributes, sku, currency_code }: MagentoProduct,
  minInstallmentValue: number,
  maxInstallments: number,
): Offer[] => {
  if (!price_info) {
    return [];
  }
  const { final_price, max_price, max_regular_price } = price_info;
  const { stock_item } = extension_attributes;
  const inStock = stock_item?.is_in_stock;
  const qtyStock = stock_item?.qty ?? 0;

  return [
    {
      "@type": "Offer",
      availability: inStock ? IN_STOCK : OUT_OF_STOCK,
      inventoryLevel: {
        value: inStock ? qtyStock || 999 : 0,
      },
      itemCondition: "https://schema.org/NewCondition",
      price: final_price,
      priceCurrency: currency_code,
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          priceType: "https://schema.org/ListPrice",
          price: max_price ?? max_regular_price,
        },
        {
          "@type": "UnitPriceSpecification",
          priceType: "https://schema.org/SalePrice",
          price: final_price,
        },
        ...calculateInstallments(
          final_price,
          minInstallmentValue,
          maxInstallments,
        ),
      ],
      sku: sku,
    },
  ];
};

const calculateInstallments = (
  finalPrice: number,
  minInstallmentValue: number,
  maxInstallments: number,
): UnitPriceSpecification[] => {
  const possibleInstallmentsCount =
    Math.floor(finalPrice / minInstallmentValue) || 1;
  const actualInstallmentsCount = Array.from(
    {
      length: Math.min(possibleInstallmentsCount, maxInstallments),
    },
    (_v, i) => +(finalPrice / (i + 1)).toFixed(2),
  );

  return actualInstallmentsCount.map<UnitPriceSpecification>((value, i) => {
    const [description, billingIncrement] = !i
      ? ["À vista", finalPrice]
      : [i + 1 + "x sem juros", value];
    return {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      description,
      billingDuration: i + 1,
      billingIncrement,
      price: finalPrice,
    };
  });
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
  url: URL,
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
  productURL: string,
): Seo => {
  const findAttribute = (attrCode: string): string => {
    const attribute = customAttributes.find(
      (attr) => attr.attribute_code === attrCode,
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
    title: metaTitle || title || "",
    description: metaDescription || "",
    canonical: productURL,
  };
};

export const toReviewAmasty = (
  products: Product[],
  productReviews: ReviewsAmastyAPI[],
): Product[] =>
  products.map((product, i) => {
    const { reviews, success, summary } = productReviews[i];
    const { reviews_count } = summary;
    if (!success || reviews_count === 0) {
      return product;
    }

    const review = reviews.map<Review>((review) => ({
      "@type": "Review",
      id: `${review.review_id}`,
      reviewHeadline: review.title,
      reviewBody: review.detail,
      author: [
        {
          "@type": "Author",
          name: review.nickname,
          verifiedBuyer: review.verified_buyer,
        },
      ],
      datePublished: review.created_at.replace(" ", "T"),
      additionalType: `${review.review_stars_percentage}`,
      reviewRating: {
        "@type": "AggregateRating",
        ratingValue: review.review_stars,
        reviewCount: 1,
      },
    }));

    const totalRating = review.reduce(
      (acc, r) => acc + Number(r.reviewRating?.ratingValue),
      0,
    );

    return {
      ...product,
      review,
      aggregateRating: {
        "@type": "AggregateRating",
        reviewCount: reviews_count,
        bestRating: MAX_RATING_VALUE,
        worstRating: MIN_RATING_VALUE,
        ratingValue: Number((totalRating / reviews_count).toFixed(2)),
      },
    };
  });

export const toProductGraphQL = (
  product: SimpleProductGraphQL | CompleteProductGraphQL,
  options: {
    originURL: URL;
    imagesQtd: number;
    defaultPath?: string;
    customAttributes?: Array<string>;
    minInstallmentValue: number;
    maxInstallments: number;
  },
): Product => {
  const {
    price_range,
    stock_status,
    only_x_left_in_stock,
    uid,
    sku,
    name,
    media_gallery,
  } = product;
  const {
    originURL,
    imagesQtd,
    defaultPath,
    minInstallmentValue,
    maxInstallments,
  } = options;
  const aggregateOffer = toAggOfferGraphQL(price_range, {
    inStock: stock_status === "IN_STOCK",
    stockLeft: only_x_left_in_stock,
    minInstallmentValue,
    maxInstallments,
  });
  const url = new URL(
    (defaultPath ?? "") + product.url_key || product.canonical_url,
    originURL.origin,
  ).href;
  const additionalProperty = toAddPropertiesGraphQL(
    product,
    options.customAttributes,
  );
  const productID = atob(uid);

  return {
    "@type": "Product",
    productID,
    sku,
    url,
    name: name?.trim() ?? "",
    gtin: sku,
    // deno-lint-ignore no-explicit-any
    image: (media_gallery as any[])
      .sort((a, b) => a.position - b.position)
      .reduce<ImageObject[]>((acc, media) => {
        if (acc.length === imagesQtd) {
          return acc;
        }
        return [...acc, toImageGraphQL(media, name)];
      }, []),
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: productID,
      url,
      name: name?.trim() ?? "",
      additionalProperty,
      hasVariant: [
        {
          "@type": "Product",
          productID,
          sku,
          url,
          name: name,
          gtin: sku,
          offers: aggregateOffer,
        },
      ],
    },
    additionalProperty,
    offers: aggregateOffer,
  };
};

const toAddPropertiesGraphQL = (
  product: SimpleProductGraphQL,
  customAttributes?: Array<string>,
) =>
  customAttributes?.reduce<PropertyValue[]>((acc, att) => {
    const attributeOnProduct = product[att as keyof SimpleProductGraphQL];
    if (!attributeOnProduct || attributeOnProduct.toString().length === 0) {
      return acc;
    }

    return [
      ...acc,
      {
        "@type": "PropertyValue",
        name: att,
        value: attributeOnProduct.toString(),
      },
    ];
  }, []) ?? [];

export const toImageGraphQL = (
  media: ProductImage,
  name: string,
): ImageObject => ({
  "@type": "ImageObject" as const,
  encodingFormat: "image",
  alternateName: media.label ?? name,
  url: media.url,
});

export interface Options {
  inStock: boolean;
  stockLeft?: number;
  minInstallmentValue: number;
  maxInstallments: number;
}
export interface ToOfferProps extends Options {
  minimum_price: ProductPrice;
}

export const toAggOfferGraphQL = (
  { maximum_price, minimum_price }: PriceRange,
  { inStock, stockLeft, minInstallmentValue, maxInstallments }: Options,
): AggregateOffer => ({
  "@type": "AggregateOffer",
  highPrice: maximum_price.regular_price.value,
  lowPrice: minimum_price.final_price.value,
  offerCount: 1,
  offers: [
    toOfferGraphQL({
      minimum_price,
      inStock,
      stockLeft,
      minInstallmentValue,
      maxInstallments,
    }),
  ],
});

export const toOfferGraphQL = ({
  minimum_price,
  inStock,
  stockLeft,
  maxInstallments,
  minInstallmentValue,
}: ToOfferProps): Offer => ({
  "@type": "Offer",
  availability: inStock ? IN_STOCK : OUT_OF_STOCK,
  inventoryLevel: {
    value: stockLeft ?? inStock ? 999 : 0,
  },
  itemCondition: "https://schema.org/NewCondition",
  price: minimum_price.final_price.value,
  priceCurrency: minimum_price.final_price.currency ?? "BRL",
  priceSpecification: [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: minimum_price.regular_price.value,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: minimum_price.final_price.value,
    },
    ...calculateInstallments(
      minimum_price.final_price.value,
      minInstallmentValue,
      maxInstallments,
    ),
  ],
});

export const toProductListingPageGraphQL = (
  { products }: PLPGraphQL,
  { categories }: CategoryGraphQL,
  options: {
    originURL: URL;
    imagesQtd: number;
    defaultPath?: string;
    customAttributes?: Array<string>;
    minInstallmentValue: number;
    maxInstallments: number;
  },
): ProductListingPage => {
  const {
    originURL,
    imagesQtd,
    defaultPath,
    customAttributes,
    minInstallmentValue,
    maxInstallments,
  } = options;
  const category = categories.items[0];
  const pagination = products.page_info;
  const listElements = toItemElement(category, originURL);

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      numberOfItems: listElements.length,
      itemListElement: listElements,
      description: category.description,
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
    filters: toFilters(products.aggregations, originURL),
    products: products.items.map((p) =>
      toProductGraphQL(p, {
        originURL,
        imagesQtd,
        defaultPath,
        customAttributes,
        maxInstallments,
        minInstallmentValue,
      })
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
  url: URL,
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
  originUrl: URL,
): Filter[] => {
  const url = new URL(originUrl);
  REMOVABLE_URL_SEARCHPARAMS.forEach((v) => url.searchParams.delete(v));

  return aggregations.reduce<Filter[]>((acc, agg) => {
    if (agg.position === null) {
      return acc;
    }

    return [
      ...acc,
      {
        "@type": "FilterToggle",
        label: agg.label,
        key: agg.attribute_code,
        values: agg.options.map((opt) =>
          toFilterValues(opt, agg.attribute_code, url)
        ),
        quantity: agg.count,
      },
    ];
  }, []);
};

const toFilterValues = (
  option: AggregationOptGraphQL,
  attributeCode: string,
  baseUrl: URL,
): FilterToggleValue => {
  const url = new URL(baseUrl);
  const selected = baseUrl.searchParams.has(attributeCode, option.value);

  selected
    ? url.searchParams.delete(attributeCode)
    : url.searchParams.set(attributeCode, option.value);

  return {
    quantity: option.count,
    label: option.label,
    value: option.value,
    selected: selected,
    url: url.href,
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
  url: URL,
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
