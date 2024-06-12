import {
  Filter,
  FilterToggleValue,
  ItemAvailability,
  OfferItemCondition,
  Product,
  ProductLeaf,
  SortOption,
  UnitPriceSpecification,
} from "../../commerce/types.ts";

const AvailabilityMap: Record<string, ItemAvailability> = {
  "in stock": "https://schema.org/InStock",
  "out of stock": "https://schema.org/OutOfStock",
};

const ConditionMap: Record<string, OfferItemCondition> = {
  "New": "https://schema.org/NewCondition",
};

export const toProduct = (product: any): Product => {
  const priceSpecification: UnitPriceSpecification[] = [];

  priceSpecification.push({
    "@type": "UnitPriceSpecification" as const,
    priceType: "https://schema.org/ListPrice" as const,
    price: product.Price,
  });
  if (product.HasSalePrice) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/SalePrice" as const,
      price: product.SalePrice,
    });
  }
  if (product.HasBankSlipPrice) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/InvoicePrice" as const,
      price: product.BankSlipPrice,
    });
  }
  if (product.HasInstallment) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/SalePrice" as const,
      priceComponentType: "https://schema.org/Installment",
      billingDuration: product.Installment,
      billingIncrement: product.InstallmentAmount,
      price: product.Installment * product.InstallmentAmount,
    });
  }
  if (product.HasSecondInstallment) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification" as const,
      priceType: "https://schema.org/SalePrice" as const,
      priceComponentType: "https://schema.org/Installment",
      billingDuration: product.SecondInstallment,
      billingIncrement: product.SecondInstallmentAmount,
      price: product.SecondInstallment * product.SecondInstallmentAmount,
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
      value: product.Score,
    });
  }
  if (product.SellsCount) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "SellsCount",
      value: product.SellsCount,
    });
  }
  if (product.ViewsCount) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "ViewsCount",
      value: product.ViewsCount,
    });
  }
  if (product.HasPromotion) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "HasPromotion",
      value: product.HasPromotion,
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
      value: product.PurchasePercentage,
    });
  }
  if (product.CustomWeight) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "CustomWeight",
      value: product.CustomWeight,
    });
  }
  if (product.LowerPrice) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "LowerPrice",
      value: product.LowerPrice,
    });
  }
  if (product.isHighlightProduct) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "isHighlightProduct",
      value: product.isHighlightProduct,
    });
  }
  if (product.LowerPriceDate) {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "LowerPriceDate",
      value: product.LowerPriceDate,
    });
  }
  product.Tags.map((tag: string) => {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "Tag",
      value: tag,
    });
  });
  product.Categories.map((category: string) => {
    additionalProperty.push({
      "@type": "PropertyValue" as const,
      name: "Categories",
      value: category,
    });
  });

  const firstAvailable =
    product.Specifications.find((specification) =>
      specification.availability == "in stock"
    ) ?? 0;

  const offers = {
    "@type": "AggregateOffer" as const,
    highPrice: product.Price,
    lowPrice: product.HasSalePrice ? product.SalePrice : product.Price,
    offerCount: priceSpecification.length,
    offers: [
      {
        "@type": "Offer" as const,
        availability: AvailabilityMap[firstAvailable.availability],
        price: product.SalePrice,
        inventoryLevel: {
          value: 1000, //TODO
        },
        itemCondition: ConditionMap[product.Condition],
        priceSpecification,
      },
    ],
  };

  const aggregateRating = product.ReviewStars > 0
    ? {
      "@type": "AggregateRating" as const,
      ratingValue: product.ReviewStars,
    }
    : undefined;

  return {
    "@type": "Product",
    productID: firstAvailable.specificationId,
    inProductGroupWithID: product.ProductId,
    name: product.Title,
    sku: product.Sku,
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
      ...product.AdicionalImageLink?.map((image: string) => ({
        "@type": "ImageObject",
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
      productGroupID: product.ProductId,
      hasVariant: product.Specifications.map((specification): ProductLeaf => ({
        "@type": "Product",
        productID: specification.SpecificationId,
        sku: specification.Sku,
        additionalProperty: specification.Variations?.map((variation) => ({
          "@type": "PropertyValue" as const,
          name: "Tamanho",
          value: variation?.ValueInt ?? variation?.ValueDouble ??
            variation?.ValueString,
        })),
        offers: {
          ...offers,
          offers: [{
            ...offers.offers[0],
            availability: AvailabilityMap[specification.availability],
          }],
        },
      })),
    },
  };
};

export const toSortOption = (sorts: any[]): SortOption[] => {
  return sorts.map((sort) => ({
    label: sort.Show,
    value: String(sort.Value),
  }));
};

export const toFilters = (filters: any[], url: URL): Filter[] => {
  return filters.map((filter) => ({
    "@type": "FilterToggle" as const,
    key: filter.Key.Value,
    label: filter.Key.Show,
    quantity: filter.Value.reduce(
      (acc: number, value: any) => acc + value.Quantity,
      0,
    ),
    values: filter.Value.map((value: any): FilterToggleValue => {
      const filterUrl = new URL(url);
      filterUrl.searchParams.append(
        "filter",
        `${filter.Key.Value}:${value.Value}`,
      );

      return ({
        label: value.Show,
        quantity: value.Quantity,
        selected: value.Checked,
        value: value.Value,
        url: filterUrl.href,
      });
    }),
  }));
};
