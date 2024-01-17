import {
  Filter,
  ImageObject,
  Offer,
  Product,
  ProductDetailsPage,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";
import { Cart } from "./types/basketJSON.ts";
import {
  Facet,
  Navigation as GridProductsNavigation,
  Product as LinxProductGroupGridProductsJSON,
} from "./types/gridProductsJSON.ts";
import {
  Item as LinxProductFromJSON,
  Model as LinxProductGroupProductJSON,
  Navigation as ProductNavigation,
  WebPage as ProductWebPage,
} from "./types/productJSON.ts";
import {
  Item as LinxProductFromList,
  Product as LinxProductGroupList,
} from "./types/productList.ts";
import {
  Item as LinxSuggestionProductJSON,
  Product as LinxSuggestionProductGroupJSON,
} from "./types/suggestionsJSON.ts";

type LinxProductGroup =
  | LinxProductGroupList
  | LinxProductGroupProductJSON
  | LinxProductGroupGridProductsJSON
  | LinxSuggestionProductGroupJSON;
type LinxProduct =
  | LinxProductFromList
  | LinxProductFromJSON
  | LinxSuggestionProductJSON;
type LinxNavigation = ProductNavigation | GridProductsNavigation;

const pickVariant = (variants: LinxProduct[], variantId: number | null) => {
  if (variantId === null) {
    return variants[0];
  }

  for (const variant of variants) {
    if (variant.ProductID === variantId) {
      return variant;
    }
  }

  return variants[0];
};

const toOffer = (variant: LinxProduct): Offer => {
  const priceSpecification: UnitPriceSpecification[] = [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: variant.Price?.ListPrice ?? variant.ListPrice ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: variant.Price?.SalesPrice ?? variant.RetailPrice ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: variant.Price?.MaxInstallmentsNoInterest?.PaymentType,
      description: variant.Price?.MaxInstallmentsNoInterest?.PaymentType,
      billingDuration: variant.Price?.MaxInstallmentsNoInterest
        ?.Installments,
      billingIncrement: variant.Price?.MaxInstallmentsNoInterest
        ?.InstallmentPrice,
      price: variant.Price?.MaxInstallmentsNoInterest?.RetailPrice ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: variant.Price?.BestInstallment?.PaymentType,
      description: variant.Price?.BestInstallment?.PaymentType,
      billingDuration: variant.Price?.BestInstallment
        ?.Installments,
      billingIncrement: variant.Price?.BestInstallment
        ?.InstallmentPrice,
      price: variant.Price?.BestInstallment?.RetailPrice ?? Infinity,
    },
  ];

  return {
    "@type": "Offer",
    seller: variant?.Price?.BuyBox?.SellerName ?? undefined,
    priceValidUntil: variant?.PromotionTo ?? undefined,
    price: variant.Price?.SalesPrice ?? variant.RetailPrice ?? Infinity,
    priceSpecification,
    inventoryLevel: {},
    availability: variant.Availability != "O"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };
};

interface ProductOptions {
  url: URL | string;
  currency: string;
  cdn: string;
}

export const toProduct = (
  product: LinxProductGroup,
  variantId: number | null,
  options: ProductOptions,
  level = 0,
): Product => {
  const { currency, url, cdn } = options;
  // Linx API returns the SKU as the tail of Items[]
  const [_, ...variants] = product?.Items ?? [];
  const variant = pickVariant(variants, variantId);

  if (!variant) {
    console.info(product.ProductID);
  }

  const offer = toOffer(variant);
  const offers = offer ? [offer] : [];

  const additionalProperty = variant.SKUOptions?.map((option) => ({
    "@type": "PropertyValue" as const,
    name: option.Name,
    value: option.Title,
    propertyID: option.Value,
  })) ?? [];

  const hasVariant = level < 1
    ? variants.map((variant) =>
      toProduct(product, variant.ProductID, options, 1)
    )
    : [];

  const toImage = (url: string) => ({
    "@type": "ImageObject" as const,
    encodingFormat: "image",
    alternateName: product.Name,
    url: new URL(url, cdn).href,
  });

  const productURL = new URL(product.Url, url);
  productURL.searchParams.set("productID", `${variant.ProductID}`);

  const { groupImages, images } = product.MediaGroups.reduce((acc, media) => {
    const { VariationPath, Zoom } = media;
    const path = Zoom?.MediaPath;

    if (VariationPath === "/" && path) {
      acc.groupImages.push(toImage(path));
    } else if (variant.VariationPath?.includes(VariationPath) && path) {
      acc.images.push(toImage(path));
    }

    return acc;
  }, { images: [], groupImages: [] } as Record<string, ImageObject[]>);

  const image = images.length !== 0
    ? images
    : groupImages.length !== 0
    ? groupImages
    : [DEFAULT_IMAGE];

  return {
    "@type": "Product",
    productID: `${variant.ProductID}`,
    sku: `${variant.SKU}`,
    url: productURL.href,
    name: variant.Name,
    gtin: product.Uom,
    brand: {
      "@type": "Brand",
      "@id": `${product.BrandID}`,
      name: product.BrandName ?? undefined,
      logo: product.BrandImageUrl ?? undefined,
    },
    additionalProperty,
    image,
    isVariantOf: {
      "@type": "ProductGroup",
      url: new URL(product.Url, url).href,
      name: product.Name,
      description: product.ShortDescription,
      image: groupImages,
      productGroupID: product.ProductID.toString(),
      additionalProperty: [],
      hasVariant,
    },
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: currency,
      lowPrice: variant.Price?.SalesPrice ?? variant.RetailPrice ?? Infinity,
      highPrice: variant.Price?.SalesPrice ?? variant.RetailPrice ?? Infinity,
      offerCount: offers.length,
      offers,
    },
  };
};

export const toFilters = (facets: Facet[], url: URL): Filter[] => {
  const currentFilters = url.searchParams.get("f")?.split("/") ?? [];

  return facets.map((f) => ({
    "@type": "FilterToggle",
    label: f.Name,
    key: f.Alias,
    values: f.AvailableOptions.map(
      ({ Url: value, Count: quantity, Label: label }) => {
        const index = currentFilters.findIndex((x) => x === value);
        const selected = index > -1;
        const newFilters = selected
          ? currentFilters.filter((x) => x !== value)
          : [...currentFilters, value];

        const params = new URLSearchParams(url.searchParams);
        params.set("f", newFilters.join("/"));

        return { value, label, quantity, selected, url: `?${params}` };
      },
    ),
    quantity: 0,
  }));
};

export const toBreadcrumbList = (
  navs: LinxNavigation[],
  url: URL | string,
) => ({
  "@type": "BreadcrumbList" as const,
  numberOfItems: navs.length,
  itemListElement: navs.map((nav, index) => ({
    "@type": "ListItem" as const,
    name: nav.Text,
    position: index + 1,
    item: new URL(nav.UrlFriendly || nav.Url, url).href,
  })),
});

export const toProductDetails = (
  webPage: ProductWebPage,
  variantId: number | null,
  options: ProductOptions,
): ProductDetailsPage => {
  const { Model: product, PageInfo: pageInfo } = webPage;

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(product.Navigation, options.url),
    product: toProduct(product, variantId, options),
    seo: {
      title: pageInfo.PageTitle,
      description: pageInfo.MetaDescription ?? "",
      canonical: pageInfo.CanonicalLink,
    },
  };
};

export const toCart = (cart: Cart, { cdn }: { cdn: string }): Cart | null => {
  if (!cart.Basket?.IsValid) {
    return null;
  }

  return ({
    ...cart,
    Model: undefined,
    PageInfo: undefined,
    Basket: {
      ...cart.Basket,
      Items: cart.Basket.Items?.map((item) => ({
        ...item,
        ImagePath: new URL(item.ImagePath || "", cdn).href,
      })),
    },
  });
};
