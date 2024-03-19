import {
  Filter,
  ImageObject,
  Offer,
  Product,
  PropertyValue,
  Seo,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { ProductGroup, ProductPrice, SEO } from "./client/types.ts";
import {
  OpenAPI,
  Product as OProduct,
  ProductInstallment,
  ProductSearch,
  ProductVariant,
  VariantProductSearch,
} from "./openapi/vnda.openapi.gen.ts";

type VNDAProductGroup = ProductSearch | OProduct;
type VNDAProduct = VariantProductSearch | ProductVariant;

interface ProductOptions {
  url: URL;
  /** Price coded currency, e.g.: USD, BRL */
  priceCurrency: string;
  productPrice?: ProductPrice | null;
}

export const getProductCategoryTag = ({ tags }: ProductGroup) =>
  tags?.filter(({ type }) => type === "categoria")[0];

export const canonicalFromTags = (
  tags: Pick<SEO, "name" | "title" | "description">[],
  url: URL,
) => {
  const pathname = tags.map((t) => t.name).join("/");
  return new URL(`/${pathname}`, url);
};

export const getSEOFromTag = (
  tags: Pick<SEO, "name" | "title" | "description">[],
  url: URL,
  seo: OpenAPI["GET /api/v2/seo_data"]["response"][0] | undefined,
): Seo => {
  const tag = tags.at(-1);
  const canonical = canonicalFromTags(tags, url);

  if (url.searchParams.has("page")) {
    canonical.searchParams.set("page", url.searchParams.get("page")!);
  }

  return {
    title: seo?.title || tag?.title || "",
    description: seo?.description || tag?.description || "",
    canonical: canonical.href,
  };
};

export const parseSlug = (slug: string) => {
  const segments = slug.split("-");
  const id = Number(segments.at(-1));

  if (!id) {
    throw new Error("Malformed slug. Expecting {slug}-{id} format");
  }

  return {
    slug: segments.slice(0, -1).join("-"),
    id: Number(segments.at(-1)),
  };
};

const pickVariant = (
  variants: VNDAProductGroup["variants"],
  variantId: string | null,
  normalize = true,
) => {
  const normalizedVariants = normalize
    ? normalizeVariants(variants)
    : variants as VariantProductSearch[];
  const [head] = normalizedVariants;

  let [target, main, available]: Array<
    VNDAProduct | null
  > = [null, head, null];

  for (const variant of normalizedVariants) {
    if (variant.sku === variantId) target = variant;
    else if (variant.main) main = variant;
    else if (variant.available && !available) available = variant;
  }

  const fallback = !available || main!.available ? main : available;

  return target || fallback || head;
};

const normalizeInstallments = (
  installments: ProductInstallment[] | number[] = [],
) => {
  if (typeof installments[0] === "number") {
    const total = (installments as number[]).reduce((acc, curr) => acc + curr);

    return [{
      number: installments.length,
      price: installments[0],
      total,
    }];
  }

  return (installments as ProductInstallment[]).map((
    { number, price, total },
  ) => ({
    number,
    price,
    total,
  }));
};

const toURL = (src: string) => src.startsWith("//") ? `https:${src}` : src;

const toOffer = ({
  price,
  sale_price,
  intl_price,
  available_quantity,
  available,
  installments = [],
}: VNDAProduct & { intl_price?: number }): Offer[] => {
  if (!price || !sale_price) {
    return [];
  }

  const priceSpecification: UnitPriceSpecification[] = [{
    "@type": "UnitPriceSpecification",
    priceType: "https://schema.org/SalePrice",
    price: sale_price,
  }];

  if (price > sale_price) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price,
    });
  }

  for (const installment of normalizeInstallments(installments)) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: "INSTALLMENT",
      description: "INSTALLMENT",
      billingDuration: installment.number,
      billingIncrement: installment.price,
      price: installment.total,
    });
  }

  const offers: Offer[] = [{
    "@type": "Offer" as const,
    seller: "VNDA",
    price,
    priceSpecification,
    inventoryLevel: {
      value: available_quantity,
    },
    availability: available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  }];

  if (intl_price) {
    offers.push({
      "@type": "Offer",
      seller: "VNDA_INTL",
      price: intl_price,
      priceSpecification: [{
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: intl_price,
      }],
      inventoryLevel: {
        value: available_quantity,
      },
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      // Static since VNDA only have a BRL price and USD when intl_price is available
      priceCurrency: "USD",
    });
  }

  return offers;
};

const toPropertyValue = (variant: VNDAProduct): PropertyValue[] =>
  Object.values(variant.properties ?? {})
    .filter(Boolean)
    .map(({ value, name }) =>
      value && ({
        "@type": "PropertyValue",
        name,
        value,
        valueReference: "SPECIFICATION",
      } as PropertyValue)
    ).filter((x): x is PropertyValue => Boolean(x));

const toPropertyValueTags = (tags: ProductSearch["tags"]): PropertyValue[] =>
  tags?.map((tag) =>
    tag && ({
      "@type": "PropertyValue",
      name: tag.name,
      value: JSON.stringify(tag),
      valueReference: "TAGS",
    } as PropertyValue)
  );

const toPropertyValueCategoryTags = (
  categoryTags: OProduct["category_tags"],
) => {
  if (!categoryTags) return [];

  return categoryTags.map((tag) => {
    return {
      "@type": "PropertyValue",
      name: tag.tag_type,
      value: tag.name,
      description: tag.title,
      valueReference: "TAGS",
    } as PropertyValue;
  });
};

// deno-lint-ignore no-explicit-any
const isProductVariant = (p: any): p is VariantProductSearch =>
  typeof p.id === "number";

const normalizeVariants = (
  variants: VNDAProductGroup["variants"] = [],
): VNDAProduct[] =>
  variants.flatMap((v) =>
    isProductVariant(v) ? [v] : Object.values(v) as VNDAProduct[]
  );

const toImageObjectVideo = (
  video: OpenAPI["GET /api/v2/products/:productId/videos"]["response"],
): ImageObject[] =>
  video?.map(({ url, embed_url, thumbnail_url }) => ({
    "@type": "ImageObject",
    encodingFormat: "video",
    contentUrl: url,
    thumbnailUrl: thumbnail_url,
    embedUrl: embed_url,
  } as ImageObject));

export const toProduct = (
  product: VNDAProductGroup,
  variantId: string | null,
  options: ProductOptions,
  level = 0,
): Product => {
  const { url, priceCurrency, productPrice } = options;
  const variant = pickVariant(product.variants, variantId);
  const variants = normalizeVariants(product.variants);
  const variantPrices = productPrice?.variants
    ? pickVariant(
      productPrice.variants as VNDAProductGroup["variants"],
      variantId,
      false,
    )
    : null;
  const offers = toOffer(variantPrices ?? variant);

  const variantUrl = new URL(
    `/produto/${product.slug}-${product.id}?skuId=${variant.sku}`,
    url.origin,
  ).href;

  const productUrl = new URL(
    `/produto/${product.slug}-${product.id}`,
    url.origin,
  ).href;

  const productID = `${variant.sku}`;
  const productGroupID = `${product.id}`;

  const myTags = "tags" in product ? product.tags : [];
  const myCategoryTags = "category_tags" in product
    ? product.category_tags
    : [];

  return {
    "@type": "Product",
    productID,
    sku: productID,
    url: variantUrl,
    name: product.name,
    description: product.description,
    additionalProperty: [
      ...toPropertyValue(variant),
      ...toPropertyValueTags(myTags),
      ...toPropertyValueCategoryTags(myCategoryTags),
    ],
    inProductGroupWithID: productGroupID,
    gtin: product.reference,
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID,
      url: productUrl,
      name: product.name,
      model: product.reference,
      additionalProperty: variants.flatMap(toPropertyValue),
      hasVariant: level === 0
        ? variants.map((v) => toProduct(product, v.sku!, options, 1))
        : [],
    },
    image: product.images?.length ?? 0 > 1
      ? product.images?.map((img) => ({
        "@type": "ImageObject" as const,
        encodingFormat: "image",
        alternateName: `${img.url}`,
        url: toURL(img.url!),
      }))
      : [
        {
          "@type": "ImageObject",
          encodingFormat: "image",
          alternateName: product.name ?? "",
          url: toURL(product.image_url ?? ""),
        },
      ],
    // images:
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: priceCurrency,
      highPrice: productPrice?.price ?? product.price!,
      lowPrice: productPrice?.sale_price ?? product.sale_price!,
      offerCount: offers.length,
      offers: offers,
    },
  };
};

const isFilterSelected = (
  typeTagsInUse: { key: string; value: string }[],
  filter: { key: string; value: string },
) =>
  Boolean(typeTagsInUse.find((inUse) =>
    inUse.key === filter.key &&
    inUse.value === filter.value
  ));

const addFilter = (
  typeTagsInUse: { key: string; value: string }[],
  filter: { key: string; value: string },
) => [...typeTagsInUse, filter];

const removeFilter = (
  typeTagsInUse: { key: string; value: string }[],
  filter: { key: string; value: string },
) =>
  typeTagsInUse.filter((inUse) =>
    !(inUse.key === filter.key && inUse.value === filter.value)
  );

export const toFilters = (
  aggregations:
    OpenAPI["GET /api/v2/products/search"]["response"]["aggregations"],
  typeTagsInUse: { key: string; value: string }[],
  cleanUrl: URL,
): Filter[] => {
  if (!aggregations) {
    return [];
  }

  const priceRange = {
    "@type": "FilterRange" as const,
    label: "Valor",
    key: "price_range",
    values: {
      min: aggregations.min_price!,
      max: aggregations.max_price!,
    },
  };

  const combinedFiltersKeys = Object.keys(aggregations.types ?? {}).concat(
    ...Object.keys(aggregations.properties ?? {}),
  );

  const types = combinedFiltersKeys.map((typeKey) => {
    const isProperty = typeKey.includes("property");

    interface AggregationType {
      name: string;
      title: string;
      count: number;
      value: string;
    }
    const typeValues: AggregationType[] = isProperty
      // deno-lint-ignore no-explicit-any
      ? ((aggregations.properties as any)[
        typeKey as string
      ] as AggregationType[])
      // deno-lint-ignore no-explicit-any
      : ((aggregations.types as any)[
        typeKey as string
      ] as AggregationType[]);

    if (isProperty) {
      typeValues.forEach((obj) => {
        if (obj.value) {
          obj.title = obj.value;
          obj.name = obj.value;
        }
      });
    }

    return {
      "@type": "FilterToggle" as const,
      key: "type",
      label: typeKey,
      quantity: 0,
      values: typeValues.map((value) => {
        const filter = { key: `type_tags[${typeKey}][]`, value: value.name };
        const isSelected = isFilterSelected(typeTagsInUse, filter);

        const nextFilters = isSelected
          ? removeFilter(typeTagsInUse, filter)
          : addFilter(typeTagsInUse, filter);

        const filterUrl = new URL(cleanUrl);
        nextFilters.forEach(({ key, value }) =>
          filterUrl.searchParams.append(key, value)
        );

        return {
          value: value.name,
          label: value.title,
          selected: isSelected,
          quantity: value.count,
          url: filterUrl.toString(),
        };
      }),
    };
  });

  return [
    priceRange,
    ...types,
  ];
};

export const typeTagExtractor = (url: URL, tags: { type?: string }[]) => {
  const cleanUrl = new URL(url);
  const keysToDestroy: string[] = [];
  const typeTags: { key: string; value: string; isProperty: boolean }[] = [];
  const typeTagRegex = /\btype_tags\[(.*?)\]\[\]/;

  cleanUrl.searchParams.forEach((value, key) => {
    const match = typeTagRegex.exec(key);

    if (match) {
      const tagValue = match[1];
      const isProperty = tagValue.includes("property");
      if (tags.some((tag) => tag.type === tagValue) || isProperty) {
        keysToDestroy.push(key);
        typeTags.push({ key, value, isProperty });
      }
    }
  });

  keysToDestroy.forEach((key) => cleanUrl.searchParams.delete(key));

  cleanUrl.searchParams.delete("page");

  return {
    typeTags,
    cleanUrl,
  };
};

export const addVideoToProduct = (
  product: Product,
  video: OpenAPI["GET /api/v2/products/:productId/videos"]["response"] | null,
): Product => ({
  ...product,
  image: [
    ...(product?.image ?? []),
    ...(video ? toImageObjectVideo(video) : []),
  ],
});
