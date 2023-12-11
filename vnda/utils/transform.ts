import {
  Filter,
  Offer,
  Product,
  PropertyValue,
  Seo,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { ProductGroup, SEO } from "./client/types.ts";
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
  useVariantImages?: boolean;
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
): Seo => {
  const tag = tags.at(-1);
  const canonical = canonicalFromTags(tags, url);

  if (url.searchParams.has("page")) {
    canonical.searchParams.set("page", url.searchParams.get("page")!);
  }

  return {
    title: tag?.title || "",
    description: tag?.description || "",
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

const pickVariant = (product: VNDAProductGroup, variantId: string | null) => {
  const variants = normalizeVariants(product.variants);
  const [head] = variants;

  let [target, main, available]: Array<
    VNDAProduct | null
  > = [null, head, null];

  for (const variant of variants) {
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
  available_quantity,
  available,
  installments = [],
}: VNDAProduct): Offer | null => {
  if (!price || !sale_price) {
    return null;
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

  return {
    "@type": "Offer",
    seller: "VNDA",
    price,
    priceSpecification,
    inventoryLevel: {
      value: available_quantity,
    },
    availability: available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  };
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

// deno-lint-ignore no-explicit-any
const isProductVariant = (p: any): p is VariantProductSearch =>
  typeof p.id === "number";

const normalizeVariants = (
  variants: VNDAProductGroup["variants"] = [],
): VNDAProduct[] =>
  variants.flatMap((v) =>
    isProductVariant(v) ? [v] : Object.values(v) as VNDAProduct[]
  );

const getVariantImages = (
  product: VNDAProductGroup,
  variantId: string | null,
) => {
  const FALLBACK_IMAGE = ""; // TODO Insert a default image URL
  const variant = pickVariant(product, variantId);

  const { images: nonTypedImages = [] } = product;
  const images = nonTypedImages as NonNullable<OProduct["images"]>;

  // Filters properly variant images
  const variantImages = images.filter(({ variant_ids = [] }) => {
    return variant_ids.some((variantID) => variantID === variant.id);
  });

  // Creates a "default" variant image
  if (variantImages.length === 0) {
    return [{
      "@type": "ImageObject" as const,
      alternateName: variant.name ?? toURL(variant.image_url ?? ""),
      url: toURL(variant.image_url ?? FALLBACK_IMAGE),
    }];
  }

  return variantImages.map((image) => {
    return {
      "@type": "ImageObject" as const,
      alternateName: variant.name ?? toURL(image.url ?? ""),
      url: toURL(image.url ?? FALLBACK_IMAGE),
    };
  });
};

export const toProduct = (
  product: VNDAProductGroup,
  variantId: string | null,
  options: ProductOptions,
  level = 0,
): Product => {
  const { url, priceCurrency, useVariantImages = false } = options;
  const variant = pickVariant(product, variantId);
  const variants = normalizeVariants(product.variants);
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
  const offer = toOffer(variant);
  const offers = offer ? [offer] : [];

  const myTags = "tags" in product ? product.tags : [];

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
    image: useVariantImages
      ? getVariantImages(product, variantId)
      : product.images?.length ?? 0 > 1
      ? product.images?.map((img) => ({
        "@type": "ImageObject" as const,
        alternateName: `${img.url}`,
        url: toURL(img.url!),
      }))
      : [
        {
          "@type": "ImageObject",
          alternateName: product.name ?? "",
          url: toURL(product.image_url ?? ""),
        },
      ],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: priceCurrency,
      highPrice: product.price!,
      lowPrice: product.sale_price!,
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
    inUse.key !== filter.key &&
    inUse.value !== filter.value
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

  return {
    typeTags,
    cleanUrl,
  };
};
