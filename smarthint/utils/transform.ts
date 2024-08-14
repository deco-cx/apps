import {
  Filter,
  FilterRangeValue,
  FilterToggleValue,
  ItemAvailability,
  OfferItemCondition,
  Product,
  ProductLeaf,
  SortOption,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import {
  FilterProp,
  Recommendations,
  RecommendationsCombination,
  RecommendationsPromotional,
  SHFilter,
  SHProduct,
  SHSort,
  SmarthintRecommendation,
} from "./typings.ts";

const AvailabilityMap: Record<string, ItemAvailability> = {
  "in stock": "https://schema.org/InStock",
  "out of stock": "https://schema.org/OutOfStock",
};

const ConditionMap: Record<string, OfferItemCondition> = {
  "New": "https://schema.org/NewCondition",
};

export const toProduct = (product: SHProduct): Product => {
  const priceSpecification: UnitPriceSpecification[] = [];

  priceSpecification.push({
    "@type": "UnitPriceSpecification" as const,
    priceType: product.HasSalePrice
      ? "https://schema.org/ListPrice"
      : "https://schema.org/SalePrice" as const,
    price: product.Price!,
  });

  if (product.HasSalePrice) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/SalePrice" as const,
      price: product.SalePrice!,
    });
  }
  if (product.HasBankSlipPrice) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/InvoicePrice" as const,
      price: product.BankSlipPrice!,
    });
  }
  if (product.HasInstallment) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/SalePrice" as const,
      priceComponentType: "https://schema.org/Installment",
      billingDuration: product.Installment,
      billingIncrement: product.InstallmentAmount,
      price: product.Installment! * product.InstallmentAmount!,
    });
  }
  if (product.HasSecondInstallment) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/SalePrice" as const,
      priceComponentType: "https://schema.org/Installment",
      billingDuration: product.SecondInstallment,
      billingIncrement: product.SecondInstallmentAmount,
      price: product.SecondInstallment! * product.SecondInstallmentAmount!,
    });
  }

  const additionalProperty = [];

  if (product.Gender) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "Gender",
      value: product.Gender,
    });
  }
  if (product.Mpn) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "Mpn",
      value: product.Mpn,
    });
  }
  if (product.MpnFather) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "MpnFather",
      value: product.MpnFather,
    });
  }
  if (product.Score) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "Score",
      value: String(product.Score),
    });
  }
  if (product.SellsCount) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "SellsCount",
      value: String(product.SellsCount),
    });
  }
  if (product.ViewsCount) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "ViewsCount",
      value: String(product.ViewsCount),
    });
  }
  if (product.HasPromotion) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "HasPromotion",
      value: String(product.HasPromotion),
    });
  }
  if (product.FirstCategory) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "FirstCategory",
      value: product.FirstCategory,
    });
  }
  if (product.LastCategory) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "LastCategory",
      value: product.LastCategory,
    });
  }
  if (product.PurchasePercentage) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "PurchasePercentage",
      value: String(product.PurchasePercentage),
    });
  }
  if (product.CustomWeight) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "CustomWeight",
      value: String(product.CustomWeight),
    });
  }
  if (product.LowerPrice) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "LowerPrice",
      value: String(product.LowerPrice),
    });
  }
  if (product.isHighlightProduct) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "isHighlightProduct",
      value: String(product.isHighlightProduct),
    });
  }
  if (product.LowerPriceDate) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "LowerPriceDate",
      value: product.LowerPriceDate,
    });
  }
  product.Tags?.map((tag: string) => {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "Tag",
      value: tag,
    });
  });
  product.Categories?.map((category: string) => {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "Categories",
      value: category,
    });
  });

  const firstAvailable =
    product.Specifications?.find((specification) =>
      specification.availability == "in stock"
    ) ?? product.Specifications![0];

  const offers = {
    "@type": "AggregateOffer" as const,
    highPrice: product.Price ?? 0,
    lowPrice: (product.HasSalePrice ? product.SalePrice : product.Price) ?? 0,
    offerCount: priceSpecification.length,
    offers: [
      {
        "@type": "Offer" as const,
        availability:
          AvailabilityMap[firstAvailable?.availability ?? "out of stock"],
        price: (product.HasSalePrice ? product.SalePrice : product.Price) ?? 0,
        inventoryLevel: {
          value: 1000, //TODO
        },
        itemCondition: ConditionMap[product.Condition || "new"],
        priceSpecification,
      },
    ],
  };

  const aggregateRating = (product.ReviewStars ?? 0) > 0
    ? {
      "@type": "AggregateRating" as const,
      ratingValue: product.ReviewStars,
    }
    : undefined;

  const specifications = product.Specifications ?? [];

  return {
    "@type": "Product",
    productID: firstAvailable.specificationId!,
    inProductGroupWithID: product.ProductId,
    name: product.Title,
    sku: product.Sku!,
    description: product.Description,
    url: `https:${product.Link}`,
    brand: {
      "@type": "Brand",
      name: product.Brand,
    },
    aggregateRating,
    category: product.ProductType,
    image: [
      {
        "@type": "ImageObject",
        url: product.ImageLink,
      },
      {
        "@type": "ImageObject",
        name: "SecondImageLink",
        url: product.SecondImageLink,
      },
      ...(product.AdicionalImageLink ?? []).map((image: string) => ({
        "@type": "ImageObject" as const,
        url: image,
      })),
      {
        "@type": "ImageObject",
        name: "ImageLinkSmall",
        url: product.ImageLinkSmall,
      },
    ],
    offers,
    additionalProperty,
    isVariantOf: {
      "@type": "ProductGroup",
      additionalProperty: [],
      productGroupID: product.ProductId!,
      hasVariant: specifications?.map((specification): ProductLeaf => ({
        "@type": "Product",
        productID: specification.specificationId!,
        sku: specification.sku!,
        additionalProperty: specification.variations?.map((variation) => ({
          "@type": "PropertyValue" as const,
          name: "Tamanho",
          value: variation.Value,
        })),
        offers: {
          ...offers,
          offers: [{
            ...offers.offers[0],
            availability:
              AvailabilityMap[specification.availability || "out of stock"],
          }],
        },
      })),
    },
  };
};

export const toSortOption = (sorts: SHSort[]): SortOption[] => {
  return sorts.map((sort) => ({
    label: sort.Show!,
    value: String(sort.Value),
  }));
};

export const toFilters = (filters: SHFilter[], url: URL): Filter[] => {
  const priceFilter = filters.find((filter) =>
    filter.Key?.Value === "finalPrice"
  );

  const priceRangeFilter = priceFilter
    ? [{
      "@type": "FilterRange" as const,
      key: priceFilter.Key!.Value!,
      label: priceFilter.Key!.Show!,
      values: priceFilter.Value!.reduce((acc, value): FilterRangeValue => {
        const [min, max] = value.Value!.split(":").map(Number);
        if (acc.min > min) acc.min = min;
        if (acc.max < max) acc.max = max;
        return acc;
      }, { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER }),
    }]
    : [];

  const toggleFilters = filters.map((filter): Filter => {
    return ({
      "@type": "FilterToggle" as const,
      key: filter.Key!.Value!,
      label: filter.Key!.Show!,
      quantity: filter.Value?.reduce(
        (acc, value) => acc + (value.Quantity ?? 0),
        0,
      ) ?? 0,
      values: filter.Value?.map((value): FilterToggleValue => {
        const filterUrl = new URL(url);
        filterUrl.searchParams.append(
          "filter",
          `${filter.Key!.Value}:${value.Value}`,
        );

        filterUrl.searchParams.delete("page");

        return ({
          label: value.Show!,
          quantity: value.Quantity!,
          selected: Boolean(value.Checked),
          value: value.Value!,
          url: filterUrl.href,
        });
      }) ?? [],
    });
  });

  return [...toggleFilters, ...priceRangeFilter];
};

export const getSortParam = (url: URL, sortParam?: number) => {
  return url.searchParams.get("sort") ??
    url.searchParams.get("searchSort") ?? sortParam ?? 0;
};

export const getFilterParam = (
  url?: URL,
  filterParam: FilterProp[] = [],
) => {
  return url?.searchParams.getAll("filter").length
    ? url.searchParams.getAll("filter")
    : filterParam.length
    ? filterParam.map((filterItem) => `${filterItem.field}:${filterItem.value}`)
    : undefined;
};

export const resolvePage = (url: URL, size: number, fromParam?: number) => {
  const page = Number(url.searchParams.get("page") ?? 1);

  const from = fromParam ?? page <= 1 ? 0 : (page - 1) * size;
  return { page, from };
};

export const getPaginationInfo = (
  url: URL,
  size: number,
  from: number,
  page: number,
  TotalResult: number = 0,
) => {
  const hasNextPage = TotalResult > (size * page);
  const hasPreviousPage = from > 0 && TotalResult > size;

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

  return {
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
  };
};

export const toRecommendation = (
  item:
    | RecommendationsPromotional
    | RecommendationsCombination
    | Recommendations,
  position: string,
  type:
    | "RecommendationsProducts"
    | "RecommendationsCombination"
    | "RecommendationsPromotional"
    | "Recommendations",
  categories?: string,
) => {
  const recommendations: SmarthintRecommendation = {
    "@type": type,
    order: item.Order,

    eventGoogleAnalytics: item.EventGoogleAnalytics,
    titleRecommendation: item.TitleRecommendation,
    nameRecommendation: item.NameRecommendation,
    position,
    categories,
    products: null,
  };

  if (type === "RecommendationsPromotional") {
    recommendations.bannerHtml =
      (item as RecommendationsPromotional).BannerHtml;
    recommendations.bannerUrl = (item as RecommendationsPromotional).BannerUrl;
    recommendations.bannerUrlClick =
      (item as RecommendationsPromotional).BannerUrlClick;
    recommendations.endDateTime =
      (item as RecommendationsPromotional).EndDateTime;
    recommendations.hasTimer = (item as RecommendationsPromotional).HasTimer;
    recommendations.positionBanner =
      (item as RecommendationsPromotional).PositionBanner;
    recommendations.startDateTime =
      (item as RecommendationsPromotional).StartDateTime;
  }

  if (type === "Recommendations") {
    recommendations.products =
      (item as Recommendations).Products?.map((product) =>
        toProduct(product)
      ) || null;
  }

  if (type === "RecommendationsPromotional") {
    recommendations.bannerHtml =
      (item as RecommendationsPromotional).BannerHtml;
    recommendations.bannerUrl = (item as RecommendationsPromotional).BannerUrl;
    recommendations.bannerUrlClick =
      (item as RecommendationsPromotional).BannerUrlClick;
    recommendations.endDateTime =
      (item as RecommendationsPromotional).EndDateTime;
    recommendations.hasTimer = (item as RecommendationsPromotional).HasTimer;
    recommendations.positionBanner =
      (item as RecommendationsPromotional).PositionBanner;
    recommendations.startDateTime =
      (item as RecommendationsPromotional).StartDateTime;
  }

  if (type === "RecommendationsCombination") {
    recommendations.combos = (item as RecommendationsCombination).Combos?.map((
      combo,
    ) => ({
      ...combo,
      products: combo.Products?.map((product) => toProduct(product)) || null,
    }));
  }

  return recommendations;
};
