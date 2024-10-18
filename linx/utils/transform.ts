import {
  Filter,
  ImageObject,
  Offer,
  Product,
  ProductDetailsPage,
  PropertyValue,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";
import { CartResponse } from "./types/basketJSON.ts";
import {
  Product as LinxProductGroupGridProductsJSON,
} from "./types/gridProductsJSON.ts";
import { NavigationInfo as ProductNavigation } from "./types/shared.ts";
import {
  Item as LinxProductFromJSON,
  Model as LinxProductGroupProductJSON,
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
import type { Facet } from "./types/shared.ts";
import { ProductAuction } from "./types/auctionJSON.ts";
import { Model as ProductAuctionDetail } from "./types/auctionDetailJSON.ts";
import { Product as LinxProductGetByIdJSON } from "./types/productByIdJSON.ts";
import { Associations } from "./types/associationsJSON.ts";

type LinxProductGroup =
  | LinxProductGroupList
  | LinxProductGroupProductJSON
  | LinxProductGroupGridProductsJSON
  | LinxSuggestionProductGroupJSON
  | LinxProductGetByIdJSON;
type LinxProduct =
  | LinxProductFromList
  | LinxProductFromJSON
  | LinxSuggestionProductJSON;
type LinxNavigation = ProductNavigation;

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

const toOffer = (variant: LinxProduct, product: LinxProductGroup): Offer => {
  const item = variant.Price ? variant : product;
  const priceSpecification: UnitPriceSpecification[] = [
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: item.Price?.ListPrice ?? item.ListPrice ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: item.Price?.SalesPrice ?? item.RetailPrice ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: item.Price?.MaxInstallmentsNoInterest?.PaymentType,
      description: item.Price?.MaxInstallmentsNoInterest?.PaymentType,
      billingDuration: item.Price?.MaxInstallmentsNoInterest
        ?.Installments,
      billingIncrement: item.Price?.MaxInstallmentsNoInterest
        ?.InstallmentPrice,
      price: item.Price?.MaxInstallmentsNoInterest?.RetailPrice ?? Infinity,
    },
    {
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: item.Price?.BestInstallment?.PaymentType,
      description: item.Price?.BestInstallment?.PaymentType,
      billingDuration: item.Price?.BestInstallment
        ?.Installments,
      billingIncrement: item.Price?.BestInstallment
        ?.InstallmentPrice,
      price: item.Price?.BestInstallment?.RetailPrice ?? Infinity,
    },
  ];

  return {
    "@type": "Offer",
    seller: item?.Price?.BuyBox?.SellerName ?? undefined,
    priceValidUntil: item?.PromotionTo ?? undefined,
    price: item.Price?.SalesPrice ?? item.RetailPrice ?? Infinity,
    priceSpecification,
    inventoryLevel: {
      value: Number(item.StockBalance) || 0,
    },
    availability:
      item.Availability != "O" && item.AvailabilityText != "Descontinuado"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
  };
};

const createAssociationPropertyValues = (
  associationsMetadata: Record<string, string>,
): PropertyValue[] => {
  if (!associationsMetadata) {
    return [];
  }

  const entries = Object.entries(associationsMetadata);
  return entries.map(([key, value]) => ({
    "@type": "PropertyValue" as const,
    name: key,
    value: value,
    propertyID: key,
    additionalType: "association",
  }));
};

interface ProductOptions {
  url: URL | string;
  currency: string;
  cdn: string;
  associations?: Associations | null;
}

export const toProduct = (
  product: LinxProductGroup,
  variantId: number | null,
  options: ProductOptions,
  level = 0,
): Product => {
  const { currency, url, cdn, associations } = options;
  // Linx API returns the SKU as the tail of Items[]
  const [_, ...variants] = product?.Items ?? [];
  const variant = pickVariant(variants, variantId);

  const offer = toOffer(variant, product);
  const offers = offer ? [offer] : [];

  const skuOptions: PropertyValue[] = variant.SKUOptions?.map((option) => ({
    "@type": "PropertyValue" as const,
    name: option.Name,
    value: option.Title,
    propertyID: option.Value,
    additionalType: "skuOptions",
  }));

  const prodOptions: PropertyValue[] = product.Options.map((option) => {
    return option.Values.map((optValue) => {
      const imagePath = optValue.ImagePath
        ? `/Custom/Content/Swatches${optValue.ImagePath}`
        : null;
      const url = imagePath ? new URL(imagePath, cdn).href : "";

      const color = optValue.Color ? optValue.Color : "";

      return {
        "@type": "PropertyValue" as const,
        name: option.Label,
        value: optValue.Value,
        image: [{
          "@type": "ImageObject" as const,
          url,
        }],
        color: color,
        additionalType: "prodOptions",
      };
    });
  }).flat();

  const metadatas: PropertyValue[] = product.ExtendedMetadatas?.map((item) => ({
    "@type": "PropertyValue" as const,
    name: item.Alias,
    value: item.Value,
    propertyID: item.PropertyMetadataID.toString(),
    additionalType: "metadatas",
  }));

  const descriptions: PropertyValue[] = product.Descriptions?.map((desc) => ({
    "@type": "PropertyValue" as const,
    name: desc.Name,
    alternateName: desc.Alias,
    value: desc.Value,
    additionalType: "descriptions",
  }));

  const categoryItems: PropertyValue[] = product.CategoryItems?.map((cat) => ({
    "@type": "PropertyValue" as const,
    name: cat.Name,
    value: cat.ID,
    additionalType: "categoryItem",
  }));

  const additionalProperty = [
    ...skuOptions,
    ...metadatas,
    ...descriptions,
    ...prodOptions,
    ...categoryItems,
  ];

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

  const isRelatedTo = associations?.ProductLists.map((list) => {
    return list.Products.map((p) => {
      const associationProperties: PropertyValue[] =
        createAssociationPropertyValues(
          {
            alias: list.Alias,
            name: list.Name,
            type: list.Type,
          },
        );

      const _prod = toProduct(
        p,
        variant.ProductID,
        {
          ...options,
          associations: null,
        },
      );

      _prod.additionalProperty?.push(...associationProperties);

      return _prod;
    });
  }).flat();

  return {
    "@type": "Product",
    productID: `${variant.ProductID}`,
    sku: `${variant.SKU}`,
    identifier: `${product.SKU}`,
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
    video: product?.Medias?.filter((option) => option.MediaType === "Video")
      .map((option) => ({
        "@type": "VideoObject" as const,
        name: option.Title || "",
        value: option.Url || "",
        propertyID: option.VariationPath,
        additionalType: "productVideo",
      })),
    image,
    isVariantOf: {
      "@type": "ProductGroup",
      url: new URL(product.Url, url).href,
      name: product.Name,
      description: product.ShortDescription,
      image: groupImages,
      productGroupID: product.ProductID.toString(),
      identifier: `${product.IntegrationID}`,
      additionalProperty: [],
      hasVariant,
    },
    isRelatedTo,
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
    values: f.SelectedOptions.concat(f.AvailableOptions).map(
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
  associations: Associations | null,
  options: ProductOptions,
): ProductDetailsPage => {
  const { Model: product, PageInfo: pageInfo } = webPage;

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(product.Navigation, options.url),
    product: toProduct(product, variantId, {
      ...options,
      associations,
    }),
    seo: {
      title: pageInfo.PageTitle,
      description: pageInfo.MetaDescription ?? "",
      canonical: pageInfo.CanonicalLink,
    },
  };
};

export const toCart = (
  cart: CartResponse,
  { cdn }: { cdn: string },
): CartResponse | null => {
  if (!cart.IsValid) {
    return null;
  }

  return ({
    ...cart,
    Shopper: {
      ...cart.Shopper,
      Basket: {
        ...cart.Shopper.Basket,
        Items: cart.Shopper.Basket.Items?.map((item) => ({
          ...item,
          ImagePath: new URL(item.ImagePath || "", cdn).href,
        })),
      },
    },
  });
};

export const toAuction = (
  auction: ProductAuction,
  { cdn }: { cdn: string },
): ProductAuction => {
  return ({
    ...auction,
    ProductImage: new URL(auction.ProductImage, cdn).href,
  });
};

export const toAuctionDetail = (
  auction: ProductAuctionDetail,
  { cdn: _cdn }: { cdn: string },
): ProductAuctionDetail => {
  // TODO: Fix image URLs
  return ({
    ...auction,
    Product: {
      ...auction.Product,
      Medias: [
        ...auction.Product.Medias,
      ],
    },
  });
};
