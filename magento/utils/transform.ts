import {
  AggregateOffer,
  ImageObject,
  ListItem,
  Offer,
  Product,
  PropertyValue,
  Seo,
} from "../../commerce/types.ts";
import {
  CustomAttribute,
  MagentoCategory,
  MagentoProduct,
} from "./client/types.ts";
import { ProductImage } from "./clientGraphql/types.ts";
import { ProductPrice } from "./clientGraphql/types.ts";
import {
  GraphQLSimpleProduct,
  PriceRange,
} from "./clientGraphql/types.ts";
import { IN_STOCK, OUT_OF_STOCK } from "./constants.ts";

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
  }: GraphQLSimpleProduct,
  originURL: URL,
  imagesQtd: number
): Product => {
  //TODO(aka-sacci-ccr): additionalProperties com flags do produto!
  //TODO(aka-sacci-ccr): Como coloco as dimensoes da imagem na URL da mesma?
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
        return [...acc, toImageGraphQL(media)];
      }, []),
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID: uid,
      url,
      name: name,
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

export const toImageGraphQL = (media: ProductImage): ImageObject => ({
  "@type": "ImageObject" as const,
  encodingFormat: "image",
  alternateName: `${media.label}`,
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
