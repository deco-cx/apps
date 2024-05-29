import {
  Filter,
  FilterToggleValue,
  Product,
  SortOption,
} from "../../commerce/types.ts";

export const toProduct = (product: any): Product => {
  return {
    "@type": "Product",
    productID: product.ProductId,
    name: product.Title,
    sku: product.Sku,
    description: product.Description,
    url: product.Link,
    brand: {
      "@type": "Brand",
      name: product.Brand,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.ReviewStars,
    },
    category: product.ProductType,
    image: [
      {
        "@type": "ImageObject",
        url: product.ImageLink,
      },
      ...product.AdicionalImageLink?.map((image: string) => ({
        "@type": "ImageObject",
        url: image,
      })),
    ],
    offers: {
      "@type": "AggregateOffer",
      highPrice: product.Price,
      lowPrice: product.SalePrice,
      offerCount: 4, //TODO
      offers: [{
        "@type": "Offer",
        availability: product.Availability,
        price: product.SalePrice,
        inventoryLevel: {
          value: 1000, //TODO
        },
        priceSpecification: [
          {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/ListPrice",
            price: product.Price,
          },
          {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/SalePrice",
            price: product.SalePrice,
          },
          {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/InvoicePrice",
            price: product.BankSlipPrice,
          },
          {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/SalePrice",
            billingIncrement: product.InstallmentAmount,
            price: product.BankSlipPrice,
            billingDuration: product.Installment,
          },
        ],
      }],
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Gender",
        value: product.Gender,
      },
      {
        "@type": "PropertyValue",
        name: "Mpn",
        value: product.Mpn,
      },
      {
        "@type": "PropertyValue",
        name: "MpnFather",
        value: product.MpnFather,
      },
      {
        "@type": "PropertyValue",
        name: "SellsCount",
        value: product.SellsCount,
      },
      {
        "@type": "PropertyValue",
        name: "ViewsCount",
        value: product.ViewsCount,
      },
      ...product.Tags.map((tag: string) => ({
        "@type": "PropertyValue",
        name: "Tag",
        value: tag,
      })),
      ...product.Categories.map((category: string) => ({
        "@type": "PropertyValue",
        name: "Categories",
        value: category,
      })),
      // ...product.AditionalFeatures.map((
      //   { key: value }: Record<string, string>,
      // ) => ({
      //   "@type": "PropertyValue",
      //   name: "AditionalFeatures",
      //   value,
      //   alternateName: key,
      // })),
    ],
  };
};

export const toSortOption = (sorts: any[]): SortOption[] => {
  return sorts.map((sort) => ({
    label: sort.Show,
    value: sort.Field,
  }));
};

export const toFilters = (filters: any[]): Filter[] => {
  return filters.map((filter) => ({
    "@type": "FilterToggle" as const,
    key: filter.Key.Value,
    label: filter.Key.Show,
    quantity: filter.Value.reduce(
      (acc: number, value: any) => acc + value.Quantity,
      0,
    ),
    values: filter.Value.map((value: any): FilterToggleValue => ({
      label: value.Show,
      quantity: value.Quantity,
      selected: value.Checked,
      value: value.Value,
      url: "", //TODO
    })),
  }));
};
