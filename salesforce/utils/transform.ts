// deno-lint-ignore-file
import { getPriceRange, removeParenthesis, slugfy } from "./utils.ts";
import type {
  ImageGroups,
  ProductBaseSalesforce,
  ProductSearch,
  productSearchAddictionalInfo,
  ProductSearchHits,
  ProductSearchRefinements,
  ProductSuggestions,
  SelectedRefinement,
  Variants,
  VariationAttributes,
} from "./types.ts";
import type {
  BreadcrumbList,
  FilterRange,
  ImageObject,
  Offer,
  Product,
  ProductDetailsPage,
  ProductGroup,
  PropertyValue,
} from "../../commerce/types.ts";
import type {
  FilterToggleValue,
  ProductListingPage,
  Search,
} from "../../commerce/types.ts";

type SalesforceProduct =
  | ProductBaseSalesforce
  | ProductSearchHits;

export const toProductPage = (
  product: ProductBaseSalesforce,
  baseURL: string,
  variantId?: string,
): ProductDetailsPage => (
  {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(product, baseURL),
    product: toProduct(product, baseURL, variantId),
    seo: {
      title: toSEOTitle(product),
      description: product.pageDescription ?? product.shortDescription ?? "",
      canonical: getProductURL(
        baseURL,
        product.name,
        product.id,
        variantId ?? "",
      ).href,
    },
  }
);

export const toProductList = (
  products: ProductSearch,
  baseURL: string,
): Product[] => {
  return products.hits.map(
    ({
      productId,
      productName,
      variationAttributes,
      image,
      currency,
      price,
      orderable,
      representedProduct,
    }) => {
      const offers = toOffer(price, orderable, orderable ? 10 : 0);
      return {
        "@type": "Product",
        id: productId,
        productID: productId,
        url: getProductURL(
          baseURL,
          productName,
          productId,
          representedProduct?.id!,
        ).href,
        name: productName,
        additionalProperty: toAdditionalProperties(variationAttributes),
        image: [
          {
            "@type": "ImageObject",
            alternateName: image.alt,
            url: image.link,
          },
        ],
        sku: representedProduct?.id ?? "",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: currency,
          highPrice: price,
          lowPrice: price,
          offerCount: offers.length,
          offers,
        },
      };
    },
  );
};

export const toProductSuggestions = (
  suggestions: ProductSuggestions,
  baseURL: string,
  imagemSearch?: ProductSearch,
): Product[] => {
  return suggestions.products.map(
    ({
      productId,
      productName,
      currency,
      price,
    }) => {
      const offers = toOffer(price, false, 0);
      const productImage = imagemSearch?.data.find((image: { id: string }) =>
        image.id === productId
      );

      return {
        "@type": "Product",
        id: productId,
        productID: productId,
        url: getProductGroupURL(
          baseURL,
          productName,
          productId,
        ).href,
        image: [
          {
            "@type": "ImageObject",
            alternateName: productImage?.imageGroups[0]?.images[0]?.alt,
            url: productImage?.imageGroups[0]?.images[0]?.link,
          },
        ],
        name: productName,
        sku: productId ?? "",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: currency,
          highPrice: price,
          lowPrice: price,
          offerCount: 0,
          offers: offers,
        },
      };
    },
  );
};
interface Facets {
  key: string;
  values: string[];
}
export const toSearchSuggestions = (
  searchPhrase: string,
  suggestions: ProductSuggestions,
  hitsCount: number,
): Search[] => {
  return suggestions.suggestedTerms.map(({ terms, originalTerm }) => {
    const facets: Facets[] = [];

    suggestions.suggestedTerms.forEach((term) => {
      if (term.originalTerm && Array.isArray(term.terms)) {
        const valuesArray = term.terms.map((subterm) => subterm.value);
        facets.push({
          key: term.originalTerm,
          values: valuesArray,
        });
      }
    });

    return {
      term: originalTerm,
      hits: hitsCount,
      href: "",
      facets,
    };
  });
};

const toSEOTitle = ({ name, pageTitle, brand }: ProductBaseSalesforce) => {
  const SEOTitle = pageTitle ?? name;
  return brand ? `${SEOTitle}, ${brand}` : SEOTitle;
};

const toBreadcrumbList = (
  { primaryCategoryId, name, id }: ProductBaseSalesforce,
  baseURL: string,
): BreadcrumbList => {
  const categories = toCategory(primaryCategoryId).split(/[>]/);

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      ...categories.map((name, index) => ({
        "@type": "ListItem" as const,
        name,
        item: new URL(
          `/${
            categories
              .slice(0, index + 1)
              .join("/")
              .toLowerCase()
          }`,
          baseURL,
        ).href,
        position: index + 1,
      })),
      {
        "@type": "ListItem",
        name: name,
        item: getProductURL(baseURL, name, id, id).href,
        position: categories.length + 1,
      },
    ],
    numberOfItems: categories.length + 1,
  };
};

export const toProduct = (
  product: ProductBaseSalesforce,
  baseURL: string,
  variantId?: string,
): Product => {
  const {
    primaryCategoryId,
    id,
    name,
    pageDescription,
    brand,
    imageGroups,
    price,
    inventory,
  } = product;

  const isVariantOf = product.variants
    ? toVariantProduct(product, product.variants, baseURL)
    : undefined;

  const variant = variantId
    ? product.variants?.find((variant) => variant.productId === variantId)
    : product.variants?.at(0);

  const offers = toOffer(
    variant?.price ?? price,
    inventory.orderable,
    inventory.stockLevel,
  );

  return {
    "@type": "Product",
    category: toCategory(primaryCategoryId),
    productID: id,
    url: getProductURL(baseURL, name, id, variantId ?? "")
      .href,
    name: name,
    description: pageDescription,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    gtin: variantId,
    additionalProperty: toVariantAdditionalProperties(
      variant?.variationValues!,
      product.variationAttributes,
    ),
    isVariantOf,
    sku: variant?.productId ?? id,
    image: toVariantImages(imageGroups, variant?.variationValues!),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.currency,
      highPrice: product.priceMax ?? product.price,
      lowPrice: product.price,
      offerCount: offers.length,
      offers,
    },
  };
};

export const toProductHit = (
  product: ProductSearchHits,
  baseURL: string,
  addictionalInformation?: any,
): Product => {
  const {
    productId,
    productName,
    image,
    price,
    orderable,
  } = product;
  const offers = toOffer(price, orderable, orderable ? 10 : 0);

  const isVariantOf = addictionalInformation?.variants?.length
    ? toVariantProductHit(product, addictionalInformation, baseURL)
    : undefined;

  return {
    "@type": "Product",
    productID: productId,
    url: getProductGroupURL(baseURL, productName, productId)
      .href,
    name: productName,
    gtin: productId,
    additionalProperty: toAdditionalProperties(
      product.variationAttributes,
      product,
    ),
    isVariantOf,
    sku: productId,
    image: [{
      "@type": "ImageObject",
      url: image.link,
      alternateName: image.alt,
    }],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.currency,
      highPrice: product.price,
      lowPrice: product.price,
      offerCount: offers.length,
      offers,
    },
  };
};

const toCategory = (category: string) =>
  category
    .replace(/[-_/]/g, ">")
    .split(">")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(">");

const toVariantProduct = (
  master: ProductBaseSalesforce,
  variants: Variants[],
  baseURL: string,
): ProductGroup => ({
  "@type": "ProductGroup",
  productGroupID: master.id,
  hasVariant: variants.map((variant) => {
    const offers = toVariantOffer(variant);
    return {
      "@type": "Product",
      category: toCategory(master.primaryCategoryId),
      productID: variant.productId,
      url:
        getProductURL(baseURL, master.name, master.id, variant.productId).href,
      name: master.name,
      description: master.pageDescription,
      brand: {
        "@type": "Brand",
        name: master.brand,
      },
      sku: variant.productId,
      gtin: variant.productId,
      additionalProperty: toVariantAdditionalProperties(
        variant.variationValues,
        master.variationAttributes,
      ),
      image: toVariantImages(master.imageGroups, variant.variationValues),
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: master.currency,
        highPrice: variant.price,
        lowPrice: variant.price,
        offerCount: offers.length,
        offers,
      },
    };
  }),
  url:
    getProductURL(baseURL, master.name, master.id, variants[0].productId).href,
  name: master.name,
  additionalProperty: toExtraAdditionalProperties(master),
  model: master.id,
});

const toVariantProductHit = (
  master: ProductSearchHits,
  variants: productSearchAddictionalInfo,
  baseURL: string,
): ProductGroup => ({
  "@type": "ProductGroup",
  productGroupID: variants?.id,
  hasVariant: variants.variants.map((variant) => {
    const offers = toVariantOffer(variant);
    return {
      "@type": "Product",
      category: toCategory(variants?.primaryCategoryId),
      productID: variant.productId,
      url:
        getProductURL(baseURL, variants?.name, variants?.id, variant.productId)
          .href,
      name: variants?.name,
      description: variants?.pageDescription,
      brand: {
        "@type": "Brand",
        name: variants?.brand,
      },
      sku: variant.productId,
      gtin: variant.productId,
      additionalProperty: toVariantAdditionalProperties(
        variant.variationValues,
        master.variationAttributes,
      ),
      image: toVariantImages(variants?.imageGroups, variant.variationValues),
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: master.currency,
        highPrice: variant.price,
        lowPrice: variant.price,
        offerCount: offers.length,
        offers,
      },
    };
  }),
  url: getProductURL(baseURL, variants?.name, variants?.id, variants.productId)
    .href,
  name: variants?.name,
  additionalProperty: toExtraAdditionalProperties(master),
  model: variants?.id,
});

const getProductGroupURL = (
  origin: string,
  productName: string,
  productId?: string,
) => new URL(`/p/${slugfy(productName)}/${productId}`, origin);

const getProductURL = (
  origin: string,
  productName: string,
  mastertId: string,
  variantId: string,
) => {
  const canonicalUrl = getProductGroupURL(origin, productName, mastertId);

  if (variantId) {
    canonicalUrl.searchParams.set("skuId", variantId);
  }

  return canonicalUrl;
};

const toAdditionalProperties = (
  variationAttributes: VariationAttributes[] | undefined,
  product?: SalesforceProduct,
): PropertyValue[] => {
  const propietiesFromVariationAttr: PropertyValue[] =
    variationAttributes?.flatMap(({ name, values }) =>
      values.map(
        (value) => ({
          "@type": "PropertyValue",
          name: name,
          value: value.name,
          propertyID: value.value,
        }),
      )
    ) ?? [];

  if (product) {
    const proprietiesFromExtraAttr = toExtraAdditionalProperties(product);
    return propietiesFromVariationAttr.concat(proprietiesFromExtraAttr);
  }

  return propietiesFromVariationAttr;
};

const toExtraAdditionalProperties = (
  product: SalesforceProduct,
): PropertyValue[] => {
  return Object.entries(product)
    .filter(([key]) => key.startsWith("c_"))
    .map(([key, value]) => ({
      "@type": "PropertyValue",
      name: key.substring(2),
      value,
      valueReference: "PROPERTY",
    }));
};

const toVariantAdditionalProperties = (
  variationValues: Record<string, string>,
  variationAttributes: VariationAttributes[] | undefined,
): PropertyValue[] => {
  if (!variationAttributes) return [];

  const result = variationAttributes.reduce((acc, attribute) => {
    const fieldValue = variationValues[attribute.id];
    const matchingValue = attribute.values.find(
      (val) => val.value === fieldValue,
    );

    if (matchingValue) {
      acc.push({
        "@type": "PropertyValue",
        name: attribute.name,
        value: matchingValue.name,
        propertyID: matchingValue.value,
      });
    }

    return acc;
  }, [] as PropertyValue[]);

  return result;
};

const toVariantImages = (
  imageGroup: ImageGroups[],
  variationValues: Record<string, string>,
): ImageObject[] =>
  imageGroup.flatMap((item) =>
    item.variationAttributes?.some(
        (attr) =>
          variationValues[attr.id] &&
          attr.values.some(
            (subAttr) => subAttr.value === variationValues[attr.id],
          ),
      ) && item.viewType == "large"
      ? item.images.map((value) => ({
        "@type": "ImageObject",
        alternateName: value.alt,
        url: value.link,
      }))
      : []
  );

const toOffer = (
  price: number,
  orderable: boolean,
  stockLevel: number,
): Offer[] => [
  {
    "@type": "Offer",
    price: price,
    inventoryLevel: { value: stockLevel },
    seller: "Salesforce",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: price,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: price,
      },
    ],
    availability: orderable
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  },
];

const toVariantOffer = (variant: Variants): Offer[] => [
  {
    "@type": "Offer",
    price: variant.price,
    inventoryLevel: { value: variant.orderable ? 10 : 0 },
    seller: "Salesforce",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: variant.price,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: variant.price,
      },
    ],
    availability: variant.orderable
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  },
];

export const toFilters = (
  refinements: ProductSearchRefinements[] = [],
  currentFilters: SelectedRefinement[] = [],
  url: URL,
  withPriceRange?: boolean,
): ProductListingPage["filters"] => {
  const filters = refinements.map((f) => {
    if (f.attributeId === "price" && withPriceRange) {
      const minValueString = removeParenthesis(
        f.values?.at(0)?.value.toString() ?? "",
      );
      const minValue = getPriceRange(minValueString, 0);
      const maxValueString = removeParenthesis(
        f.values?.at(-1)?.value.toString() ?? "",
      );
      const maxValue = getPriceRange(maxValueString, 1);
      return {
        "@type": "FilterRange" as const,
        values: {
          min: minValue,
          max: maxValue,
        },
        label: f.label,
        key: f.attributeId,
      };
    }
    const filterValues = (f.values ?? []).map(
      ({ value, hitCount: quantity, label }) => {
        const selected = currentFilters.some(
          (item) => item.key === f.attributeId && item.value === value,
        );

        const params = new URLSearchParams(url.searchParams);
        selected ? params.delete(`filter.${f.attributeId}`, value) : null;
        params.delete("page");

        return {
          value: f.attributeId === "price"
            ? removeParenthesis(value).replace("..", ":")
            : value,
          label,
          quantity,
          selected,
          url: `?${
            filtersToSearchParams(
              selected ? [] : [{ key: f.attributeId, value }],
              params,
            )
          }`,
        } as FilterToggleValue;
      },
    ).filter((item) => item.quantity);

    const quantity = filterValues.reduce(
      (acc, current) => acc + current.quantity,
      0,
    );

    if (quantity === 0) return null;

    return {
      "@type": "FilterToggle" as const,
      label: f.label,
      key: f.attributeId,
      values: filterValues,
      quantity,
    };
  }).filter((item) => !!item);

  return filters as ProductListingPage["filters"];
};

export const filtersToSearchParams = (
  selectedRefinements: SelectedRefinement[],
  paramsToPersist?: URLSearchParams,
) => {
  const searchParams = new URLSearchParams(paramsToPersist);

  for (const { key, value } of selectedRefinements) {
    searchParams.append(`filter.${key}`, value);
  }

  return searchParams;
};

export const filtersFromURL = (url: URL) => {
  const selectedRefinements: SelectedRefinement[] = [];

  url.searchParams.forEach((value, name) => {
    const [filter, key] = name.split(".");

    if (filter === "filter" && typeof key === "string") {
      selectedRefinements.push({ key, value });
    }
  });

  return selectedRefinements;
};

export const getHeaders = (
  token: string,
): Headers => {
  const headers = new Headers({
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  });
  return headers;
};
