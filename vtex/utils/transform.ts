import type {
  AggregateOffer,
  Brand,
  BreadcrumbList,
  Filter,
  FilterToggleValue,
  Offer,
  PageType,
  Product,
  ProductDetailsPage,
  ProductGroup,
  PropertyValue,
  SiteNavigationElement,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";
import { formatRange } from "../../commerce/utils/filters.ts";
import { slugify } from "./slugify.ts";
import type {
  Brand as BrandVTEX,
  Category,
  Facet as FacetVTEX,
  FacetValueBoolean,
  FacetValueRange,
  Item as SkuVTEX,
  LegacyFacet,
  LegacyItem as LegacySkuVTEX,
  LegacyProduct as LegacyProductVTEX,
  OrderForm,
  PageType as PageTypeVTEX,
  Product as ProductVTEX,
  ProductRating,
  ProductReviewData,
  SelectedFacet,
  Seller as SellerVTEX,
  Teasers,
} from "./types.ts";

const DEFAULT_CATEGORY_SEPARATOR = ">";

const isLegacySku = (sku: LegacySkuVTEX | SkuVTEX): sku is LegacySkuVTEX =>
  typeof (sku as LegacySkuVTEX).variations?.[0] === "string";

const isLegacyProduct = (
  product: ProductVTEX | LegacyProductVTEX,
): product is LegacyProductVTEX => product.origin !== "intelligent-search";

const getProductGroupURL = (
  origin: string,
  { linkText }: { linkText: string },
) => new URL(`/${linkText}/p`, origin);

const getProductURL = (
  origin: string,
  product: { linkText: string },
  skuId?: string,
) => {
  const canonicalUrl = getProductGroupURL(origin, product);

  if (skuId) {
    canonicalUrl.searchParams.set("skuId", skuId);
  }

  return canonicalUrl;
};

const nonEmptyArray = <T>(
  array: T[] | null | undefined,
) => (Array.isArray(array) && array.length > 0 ? array : null);

interface ProductOptions {
  baseUrl: string;
  /** Price coded currency, e.g.: USD, BRL */
  priceCurrency: string;
  imagesByKey?: Map<string, string>;
}

/** Returns first available sku */
const findFirstAvailable = (items: Array<LegacySkuVTEX | SkuVTEX>) =>
  items?.find((item) =>
    Boolean(
      item?.sellers?.find((s) => s.commertialOffer?.AvailableQuantity > 0),
    )
  );

export const pickSku = <T extends ProductVTEX | LegacyProductVTEX>(
  product: T,
  maybeSkuId?: string,
): T["items"][number] => {
  const skuId = maybeSkuId ?? findFirstAvailable(product.items)?.itemId ??
    product.items[0]?.itemId;

  for (const item of product.items) {
    if (item.itemId === skuId) {
      return item;
    }
  }

  throw new Error(`Missing sku ${skuId} on product ${product.productName}`);
};

const toAccessoryOrSparePartFor = <T extends ProductVTEX | LegacyProductVTEX>(
  sku: T["items"][number],
  kitItems: T[],
  options: ProductOptions,
) => {
  const productBySkuId = kitItems.reduce((map, product) => {
    product.items.forEach((item) => map.set(item.itemId, product));

    return map;
  }, new Map<string, T>());

  return sku.kitItems
    ?.map(({ itemId }) => {
      const product = productBySkuId.get(itemId);

      /** Sometimes VTEX does not return what I've asked for */
      if (!product) return;

      const sku = pickSku(product, itemId);

      return toProduct(product, sku, 0, options);
    })
    .filter((p): p is Product => typeof p !== "undefined");
};

export const forceHttpsOnAssets = (orderForm: OrderForm) => {
  orderForm.items.forEach((item) => {
    if (item.imageUrl) {
      item.imageUrl = item.imageUrl.startsWith("http://")
        ? item.imageUrl.replace("http://", "https://")
        : item.imageUrl;
    }
  });
  return orderForm;
};

export const toProductPage = <T extends ProductVTEX | LegacyProductVTEX>(
  product: T,
  sku: T["items"][number],
  kitItems: T[],
  options: ProductOptions,
): Omit<ProductDetailsPage, "seo"> => {
  const partialProduct = toProduct(product, sku, 0, options);
  // This is deprecated. Compose this loader at loaders > product > extension > detailsPage.ts
  const isAccessoryOrSparePartFor = toAccessoryOrSparePartFor(
    sku,
    kitItems,
    options,
  );

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(product, options),
    product: { ...partialProduct, isAccessoryOrSparePartFor },
  };
};

export const inStock = (offer: Offer) =>
  offer.availability === "https://schema.org/InStock";

// Smallest Available Spot Price First
export const bestOfferFirst = (a: Offer, b: Offer) => {
  if (inStock(a) && !inStock(b)) {
    return -1;
  }

  if (!inStock(a) && inStock(b)) {
    return 1;
  }

  return a.price - b.price;
};

const getHighPriceIndex = (offers: Offer[]) => {
  let it = offers.length - 1;
  for (; it > 0 && !inStock(offers[it]); it--);
  return it;
};

const splitCategory = (firstCategory: string) =>
  firstCategory.split("/").filter(Boolean);

const toAdditionalPropertyCategories = <
  P extends LegacyProductVTEX | ProductVTEX,
>(
  product: P,
): Product["additionalProperty"] => {
  const categories = new Set<string>();
  const categoryIds = new Set<string>();

  product.categories.forEach((productCategory, i) => {
    const category = splitCategory(productCategory);
    const categoryId = splitCategory(product.categoriesIds[i]);

    category.forEach((splitCategoryItem, j) => {
      categories.add(splitCategoryItem);
      categoryIds.add(categoryId[j]);
    });
  });

  const categoriesArray = Array.from(categories);
  const categoryIdsArray = Array.from(categoryIds);

  return categoriesArray.map((category, index) =>
    toAdditionalPropertyCategory({
      propertyID: categoryIdsArray[index],
      value: category || "",
    })
  );
};

export const toAdditionalPropertyCategory = ({
  propertyID,
  value,
}: {
  propertyID: string;
  value: string;
}): PropertyValue => ({
  "@type": "PropertyValue" as const,
  name: "category",
  propertyID,
  value,
});

const toAdditionalPropertyClusters = <
  P extends LegacyProductVTEX | ProductVTEX,
>(
  product: P,
): Product["additionalProperty"] => {
  const mapEntriesToIdName = ([id, name]: [string, unknown]) => ({
    id,
    name: name as string,
  });

  const allClusters = isLegacyProduct(product)
    ? Object.entries(product.productClusters).map(mapEntriesToIdName)
    : product.productClusters;

  const highlightsSet = isLegacyProduct(product)
    ? new Set(Object.keys(product.clusterHighlights))
    : new Set(product.clusterHighlights.map(({ id }) => id));

  return allClusters.map((cluster) =>
    toAdditionalPropertyCluster({
      propertyID: cluster.id,
      value: cluster.name || "",
    }, highlightsSet)
  );
};

export const toAdditionalPropertyCluster = (
  { propertyID, value }: { propertyID: string; value: string },
  highlights?: Set<string>,
): PropertyValue => ({
  "@type": "PropertyValue",
  name: "cluster",
  value,
  propertyID,
  description: highlights?.has(propertyID) ? "highlight" : undefined,
});

const toAdditionalPropertyReferenceIds = (
  referenceId: Array<{ Key: string; Value: string }>,
): Product["additionalProperty"] => {
  return referenceId.map(({ Key, Value }) =>
    toAdditionalPropertyReferenceId({ name: Key, value: Value })
  );
};

export const toAdditionalPropertyReferenceId = ({
  name,
  value,
}: {
  name: string;
  value: string;
}): PropertyValue => ({
  "@type": "PropertyValue",
  name,
  value,
  valueReference: "ReferenceID",
});

const getImageKey = (src = "") => {
  return src;

  // TODO: figure out how we can improve this
  // const match = new URLPattern({
  //   pathname: "/arquivos/ids/:skuId/:imageId",
  // }).exec(src);

  // if (match == null) {
  //   return src;
  // }

  // return `${match.pathname.groups.imageId}${match.search.input}`;
};

export const aggregateOffers = (
  offers: Offer[],
  priceCurrency?: string,
): AggregateOffer | undefined => {
  const sorted = offers.sort(bestOfferFirst);

  if (sorted.length === 0) return;

  const highPriceIndex = getHighPriceIndex(sorted);
  const lowPriceIndex = 0;

  return {
    "@type": "AggregateOffer",
    priceCurrency,
    highPrice: sorted[highPriceIndex]?.price ?? null,
    lowPrice: sorted[lowPriceIndex]?.price ?? null,
    offerCount: sorted.length,
    offers: sorted,
  };
};

export const toProduct = <P extends LegacyProductVTEX | ProductVTEX>(
  product: P,
  sku: P["items"][number],
  level = 0, // prevent inifinte loop while self referencing the product
  options: ProductOptions,
): Product => {
  const { baseUrl, priceCurrency } = options;
  const {
    brand,
    brandId,
    brandImageUrl,
    productId,
    productReference,
    description,
    releaseDate,
    items,
  } = product;
  const { name, ean, itemId: skuId, referenceId = [], kitItems, videos } = sku;
  const nonEmptyVideos = nonEmptyArray(videos);
  const imagesByKey = options.imagesByKey ??
    items
      .flatMap((i) => i.images)
      .reduce((map, img) => {
        map.set(getImageKey(img.imageUrl), img.imageUrl);
        return map;
      }, new Map<string, string>());

  const groupAdditionalProperty = isLegacyProduct(product)
    ? legacyToProductGroupAdditionalProperties(product)
    : toProductGroupAdditionalProperties(product);
  const specificationsAdditionalProperty = isLegacySku(sku)
    ? toAdditionalPropertiesLegacy(sku)
    : toAdditionalProperties(sku);
  const referenceIdAdditionalProperty = toAdditionalPropertyReferenceIds(
    referenceId,
  );
  const images = nonEmptyArray(sku.images);
  const offers = (sku.sellers ?? []).map(
    isLegacyProduct(product) ? toOfferLegacy : toOffer,
  );

  const isVariantOf = level < 1
    ? ({
      "@type": "ProductGroup",
      productGroupID: productId,
      hasVariant: items.map((sku) =>
        toProduct(product, sku, 1, { ...options, imagesByKey })
      ),
      url: getProductGroupURL(baseUrl, product).href,
      name: product.productName,
      additionalProperty: groupAdditionalProperty,
      model: productReference,
    } satisfies ProductGroup)
    : undefined;

  const finalImages = images?.map(({ imageUrl, imageText, imageLabel }) => {
    const url = imagesByKey.get(getImageKey(imageUrl)) ?? imageUrl;
    const alternateName = imageText || imageLabel || "";
    const name = imageLabel || "";
    const encodingFormat = "image";

    return {
      "@type": "ImageObject" as const,
      alternateName,
      url,
      name,
      encodingFormat,
    };
  }) ?? [DEFAULT_IMAGE];

  const finalVideos = nonEmptyVideos?.map((video) => {
    const url = video;
    const alternateName = "Product video";
    const name = "Product video";
    const encodingFormat = "video";
    return {
      "@type": "VideoObject" as const,
      alternateName,
      contentUrl: url,
      name,
      encodingFormat,
    };
  });

  // From schema.org: A category for the item. Greater signs or slashes can be used to informally indicate a category hierarchy
  const categoriesString = splitCategory(product.categories[0]).join(
    DEFAULT_CATEGORY_SEPARATOR,
  );

  const categoryAdditionalProperties = toAdditionalPropertyCategories(product);
  const clusterAdditionalProperties = toAdditionalPropertyClusters(product);

  const additionalProperty = specificationsAdditionalProperty
    .concat(categoryAdditionalProperties ?? [])
    .concat(clusterAdditionalProperties ?? [])
    .concat(referenceIdAdditionalProperty ?? []);

  return {
    "@type": "Product",
    category: categoriesString,
    productID: skuId,
    url: getProductURL(baseUrl, product, sku.itemId).href,
    name,
    description,
    brand: {
      "@type": "Brand",
      "@id": brandId?.toString(),
      name: brand,
      logo: brandImageUrl,
    },
    isAccessoryOrSparePartFor: kitItems?.map(({ itemId }) => ({
      "@type": "Product",
      productID: itemId,
      sku: itemId,
    })),
    inProductGroupWithID: productId,
    sku: skuId,
    gtin: ean,
    releaseDate,
    additionalProperty,
    isVariantOf,
    image: finalImages,
    video: finalVideos,
    offers: aggregateOffers(offers, priceCurrency),
  };
};

const toBreadcrumbList = (
  product: ProductVTEX | LegacyProductVTEX,
  { baseUrl }: ProductOptions,
): BreadcrumbList => {
  const { categories, productName } = product;
  const names = categories[0]?.split("/").filter(Boolean);
  const segments = names.map(slugify);

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      ...names.map((name, index) => {
        const position = index + 1;

        return {
          "@type": "ListItem" as const,
          name,
          item:
            new URL(`/${segments.slice(0, position).join("/")}`, baseUrl).href,
          position,
        };
      }),
      {
        "@type": "ListItem",
        name: productName,
        item: getProductGroupURL(baseUrl, product).href,
        position: categories.length + 1,
      },
    ],
    numberOfItems: categories.length + 1,
  };
};

const legacyToProductGroupAdditionalProperties = (product: LegacyProductVTEX) =>
  product.allSpecifications?.flatMap((name) => {
    const values = (product as unknown as Record<string, string[]>)[name];

    return values.map((value) =>
      toAdditionalPropertySpecification({ name, value })
    );
  }) ?? [];

const toProductGroupAdditionalProperties = ({ properties = [] }: ProductVTEX) =>
  properties.flatMap(({ name, values }) =>
    values.map(
      (value) =>
        ({
          "@type": "PropertyValue",
          name,
          value,
          valueReference: "PROPERTY" as string,
        }) as const,
    )
  );

const toAdditionalProperties = (sku: SkuVTEX): PropertyValue[] =>
  sku.variations?.flatMap(({ name, values }) =>
    values.map((value) => toAdditionalPropertySpecification({ name, value }))
  ) ?? [];

export const toAdditionalPropertySpecification = ({
  name,
  value,
  propertyID,
}: {
  name: string;
  value: string;
  propertyID?: string;
}): PropertyValue => ({
  "@type": "PropertyValue",
  name,
  value,
  propertyID,
  valueReference: "SPECIFICATION",
});

const toAdditionalPropertiesLegacy = (sku: LegacySkuVTEX): PropertyValue[] => {
  const { variations = [], attachments = [] } = sku;

  const specificationProperties = variations.flatMap((variation) =>
    sku[variation].map((value) =>
      toAdditionalPropertySpecification({ name: variation, value })
    )
  );

  const attachmentProperties = attachments.map(
    (attachment) =>
      ({
        "@type": "PropertyValue",
        propertyID: `${attachment.id}`,
        name: attachment.name,
        value: attachment.domainValues,
        required: attachment.required,
        valueReference: "ATTACHMENT",
      }) as const,
  );

  return [...specificationProperties, ...attachmentProperties];
};

const toOffer = (
  { commertialOffer: offer, sellerId, sellerName }: SellerVTEX,
): Offer => ({
  "@type": "Offer",
  price: offer.spotPrice ?? offer.Price,
  seller: sellerId,
  sellerName,
  priceValidUntil: offer.PriceValidUntil,
  inventoryLevel: { value: offer.AvailableQuantity },
  giftSkuIds: offer.GiftSkuIds ?? [],
  teasers: offer.teasers ?? [],
  priceSpecification: [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: offer.ListPrice,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: offer.Price,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SRP",
      price: offer.PriceWithoutDiscount,
    },
    ...offer.Installments.map(
      (installment): UnitPriceSpecification => ({
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        priceComponentType: "https://schema.org/Installment",
        name: installment.PaymentSystemName,
        description: installment.Name,
        billingDuration: installment.NumberOfInstallments,
        billingIncrement: installment.Value,
        price: installment.TotalValuePlusInterestRate,
      }),
    ),
  ],
  availability: offer.AvailableQuantity > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock",
});

const toOfferLegacy = (seller: SellerVTEX): Offer => {
  const otherTeasers = seller.commertialOffer.DiscountHighLight?.map((i) => {
    const discount = i as Record<string, string>;
    const [_k__BackingField, discountName] = Object.entries(discount)?.[0] ??
      [];

    const teasers: Teasers = {
      name: discountName,
      conditions: {
        minimumQuantity: 0,
        parameters: [],
      },
      effects: {
        parameters: [],
      },
    };

    return teasers;
  }) ?? [];

  return {
    ...toOffer(seller),
    teasers: [
      ...otherTeasers,
      ...(seller.commertialOffer.Teasers ?? []).map((teaser) => ({
        name: teaser["<Name>k__BackingField"],
        generalValues: teaser["<GeneralValues>k__BackingField"],
        conditions: {
          minimumQuantity: teaser["<Conditions>k__BackingField"][
            "<MinimumQuantity>k__BackingField"
          ],
          parameters: teaser["<Conditions>k__BackingField"][
            "<Parameters>k__BackingField"
          ].map((parameter) => ({
            name: parameter["<Name>k__BackingField"],
            value: parameter["<Value>k__BackingField"],
          })),
        },
        effects: {
          parameters: teaser["<Effects>k__BackingField"][
            "<Parameters>k__BackingField"
          ].map((parameter) => ({
            name: parameter["<Name>k__BackingField"],
            value: parameter["<Value>k__BackingField"],
          })),
        },
      })),
    ],
  };
};

export const legacyFacetToFilter = (
  name: string,
  facets: LegacyFacet[],
  url: URL,
  map: string,
  term: string,
  behavior: "dynamic" | "static",
  ignoreCaseSelected?: boolean,
): Filter | null => {
  const mapSegments = map.split(",").filter((x) => x.length > 0);
  const pathSegments = term.replace(/^\//, "").split("/").slice(
    0,
    mapSegments.length,
  );

  const mapSet = new Set(
    mapSegments.map((i) => ignoreCaseSelected ? i.toLowerCase() : i),
  );
  const pathSet = new Set(
    pathSegments.map((i) => ignoreCaseSelected ? i.toLowerCase() : i),
  );

  // for productClusterIds, we have to use the full path
  // example:
  // category2/123?map=c,productClusterIds -> DO NOT WORK
  // category1/category2/123?map=c,c,productClusterIds -> WORK
  const hasProductClusterIds = mapSegments.includes("productClusterIds");
  const hasToBeFullpath = hasProductClusterIds || mapSegments.includes("ft") ||
    mapSegments.includes("b");

  const getLink = (facet: LegacyFacet, selected: boolean) => {
    const index = pathSegments.findIndex((s) => {
      if (ignoreCaseSelected) {
        return s.toLowerCase() === facet.Value.toLowerCase();
      }

      return s === facet.Value;
    });

    const map = hasToBeFullpath
      ? facet.Link.split("map=")[1].split(",")
      : [facet.Map];
    const value = hasToBeFullpath
      ? facet.Link.split("?")[0].slice(1).split("/")
      : [facet.Value];

    const pathSegmentsFiltered = hasProductClusterIds
      ? [pathSegments[mapSegments.indexOf("productClusterIds")]]
      : [];
    const mapSegmentsFiltered = hasProductClusterIds
      ? ["productClusterIds"]
      : [];

    const _mapSegments = hasToBeFullpath ? mapSegmentsFiltered : mapSegments;
    const _pathSegments = hasToBeFullpath ? pathSegmentsFiltered : pathSegments;

    const newMap = selected
      ? [...mapSegments.filter((_, i) => i !== index)]
      : [..._mapSegments, ...map];
    const newPath = selected
      ? [...pathSegments.filter((_, i) => i !== index)]
      : [..._pathSegments, ...value];

    // Insertion-sort like algorithm. Uses the c-continuum theorem
    const zipped: [string, string][] = [];
    for (let it = 0; it < newMap.length; it++) {
      let i = 0;
      while (
        i < zipped.length && (zipped[i][0] === "c" || zipped[i][0] === "C")
      ) i++;

      zipped.splice(i, 0, [newMap[it], newPath[it]]);
    }

    const link = new URL(`/${zipped.map(([, s]) => s).join("/")}`, url);
    link.searchParams.set("map", zipped.map(([m]) => m).join(","));
    if (behavior === "static") {
      link.searchParams.set(
        "fmap",
        url.searchParams.get("fmap") || mapSegments.join(","),
      );
    }
    const currentQuery = url.searchParams.get("q");
    if (currentQuery) {
      link.searchParams.set("q", currentQuery);
    }

    return `${link.pathname}${link.search}`;
  };

  return {
    "@type": "FilterToggle",
    quantity: facets?.length,
    label: name,
    key: name,
    values: facets.map((facet) => {
      const normalizedFacet = name !== "PriceRanges"
        ? facet
        : normalizeFacet(facet);

      const selected = mapSet.has(
        ignoreCaseSelected
          ? normalizedFacet.Map.toLowerCase()
          : normalizedFacet.Map,
      ) &&
        pathSet.has(
          ignoreCaseSelected
            ? normalizedFacet.Value.toLowerCase()
            : normalizedFacet.Value,
        );

      return {
        value: normalizedFacet.Value,
        quantity: normalizedFacet.Quantity,
        url: getLink(normalizedFacet, selected),
        label: normalizedFacet.Name,
        selected,
        children: facet.Children?.length > 0
          ? legacyFacetToFilter(
            normalizedFacet.Name,
            facet.Children,
            url,
            map,
            term,
            behavior,
          )
          : undefined,
      };
    }),
  };
};

export const filtersToSearchParams = (
  selectedFacets: SelectedFacet[],
  paramsToPersist?: URLSearchParams,
) => {
  const searchParams = new URLSearchParams(paramsToPersist);

  for (const { key, value } of selectedFacets) {
    searchParams.append(`filter.${key}`, value);
  }

  return searchParams;
};

const fromLegacyMap: Record<string, string> = {
  priceFrom: "price",
  productClusterSearchableIds: "productClusterIds",
};

export const legacyFacetsNormalize = (map: string, path: string) => {
  // Replace legacy price path param to IS price facet format
  // exemple: de-34,90-a-56,90 turns to 34.90:56.90
  // may this regex have to be adjusted for international stores
  const value = path.replace(
    /de-(?<from>\d+[,]?[\d]+)-a-(?<to>\d+[,]?[\d]+)/,
    (_match, from, to) => {
      return `${from.replace(",", ".")}:${to.replace(",", ".")}`;
    },
  );

  const key = fromLegacyMap[map] || map;

  return { key, value };
};

/**
 * Transform ?map urls into selected facets. This happens when a store is migrating
 * to Deco and also migrating from VTEX Legacy to VTEX Intelligent Search.
 */
export const legacyFacetsFromURL = (url: URL) => {
  const mapSegments = url.searchParams.get("map")?.split(",") ?? [];
  const pathSegments = url.pathname.split("/").slice(1); // Remove first slash
  const length = Math.min(mapSegments.length, pathSegments.length);

  const selectedFacets: SelectedFacet[] = [];
  for (let it = 0; it < length; it++) {
    const facet = legacyFacetsNormalize(mapSegments[it], pathSegments[it]);

    selectedFacets.push(facet);
  }

  return selectedFacets;
};

export const filtersFromURL = (url: URL) => {
  const selectedFacets: SelectedFacet[] = legacyFacetsFromURL(url);

  url.searchParams.forEach((value, name) => {
    const [filter, key] = name.split(".");

    if (filter === "filter" && typeof key === "string") {
      selectedFacets.push({ key, value });
    }
  });

  return selectedFacets;
};

export const mergeFacets = (
  f1: SelectedFacet[],
  f2: SelectedFacet[],
): SelectedFacet[] => {
  const facetKey = (facet: SelectedFacet) =>
    `key:${facet.key}-value:${facet.value}`;
  const merged = new Map<string, SelectedFacet>();

  for (const f of f1) {
    merged.set(facetKey(f), f);
  }
  for (const f of f2) {
    merged.set(facetKey(f), f);
  }

  return [...merged.values()];
};

const isValueRange = (
  facet: FacetValueRange | FacetValueBoolean,
): facet is FacetValueRange =>
  // deno-lint-ignore no-explicit-any
  Boolean((facet as any).range);

const facetToToggle = (
  selectedFacets: SelectedFacet[],
  key: string,
  paramsToPersist?: URLSearchParams,
) =>
(item: FacetValueRange | FacetValueBoolean): FilterToggleValue => {
  const { quantity, selected } = item;
  const isRange = isValueRange(item);

  const value = isRange
    ? formatRange(item.range.from, item.range.to)
    : item.value;
  const label = isRange ? value : item.name;
  const facet = { key, value };

  const filters = selected
    ? selectedFacets.filter((f) => f.key !== key || f.value !== value)
    : [...selectedFacets, facet];

  return {
    value,
    quantity,
    selected,
    url: `?${filtersToSearchParams(filters, paramsToPersist)}`,
    label,
  };
};

export const toFilter =
  (selectedFacets: SelectedFacet[], paramsToPersist?: URLSearchParams) =>
  ({ key, name, quantity, values }: FacetVTEX): Filter => ({
    "@type": "FilterToggle",
    key,
    label: name,
    quantity: quantity,
    values: values.map(facetToToggle(selectedFacets, key, paramsToPersist)),
  });

function nodeToNavbar(node: Category): SiteNavigationElement {
  const url = new URL(node.url, "https://example.com");

  return {
    "@type": "SiteNavigationElement",
    url: `${url.pathname}${url.search}`,
    name: node.name,
    children: node.children.map(nodeToNavbar),
  };
}

export const categoryTreeToNavbar = (
  tree: Category[],
): SiteNavigationElement[] => tree.map(nodeToNavbar);

export const toBrand = (
  { id, name, imageUrl, metaTagDescription }: BrandVTEX,
): Brand => ({
  "@type": "Brand",
  "@id": `${id}`,
  name,
  logo: imageUrl ?? undefined,
  description: metaTagDescription,
});

export const normalizeFacet = (facet: LegacyFacet) => {
  return {
    ...facet,
    Map: "priceFrom",
    Value: facet.Slug!,
  };
};

export const toReview = (
  products: Product[],
  ratings: ProductRating[],
  reviews: ProductReviewData[],
): Product[] => {
  return products.map((p, index) => {
    const reviewCount = ratings.reduce(
      (acc, curr) => acc + (curr.totalCount || 0),
      0,
    );

    const productReviews = reviews[index].data || [];

    return {
      ...p,
      aggregateRating: {
        "@type": "AggregateRating",
        reviewCount,
        ratingCount: reviewCount,
        ratingValue: ratings[index]?.average || 0,
      },
      review: productReviews.map((_, reviewIndex) => ({
        "@type": "Review",
        id: productReviews[reviewIndex]?.id?.toString(),
        author: [{
          "@type": "Author",
          name: productReviews[reviewIndex]?.reviewerName,
          verifiedBuyer: productReviews[reviewIndex]?.verifiedPurchaser,
        }],
        itemReviewed: productReviews[reviewIndex]?.productId,
        datePublished: productReviews[reviewIndex]?.reviewDateTime,
        reviewHeadline: productReviews[reviewIndex]?.title,
        reviewBody: productReviews[reviewIndex]?.text,
        reviewRating: {
          "@type": "AggregateRating",
          ratingValue: productReviews[reviewIndex]?.rating || 0,
        },
      })),
    };
  });
};

type ProductMap = Record<string, Product>;

export const sortProducts = (
  products: Product[],
  orderOfIdsOrSkus: string[],
  prop: "sku" | "inProductGroupWithID",
) => {
  const productMap: ProductMap = {};

  products.forEach((product) => {
    productMap[product[prop] || product["sku"]] = product;
  });

  return orderOfIdsOrSkus.map((id) => productMap[id]);
};

export const parsePageType = (p: PageTypeVTEX): PageType => {
  const type = p.pageType;

  // Search or Busca vazia
  if (type === "FullText") {
    return "Search";
  }

  // A page that vtex doesn't recognize
  if (type === "NotFound") {
    return "Unknown";
  }

  return type;
};
