import {
  Filter,
  ListItem,
  Offer,
  Product,
  PropertyValue,
  QuantitativeValue,
} from "../../commerce/types.ts";
import {
  LanguageTypes,
  PriceInterval,
  ProductBaseNuvemShop,
  ProductImage,
  ProductVariant,
} from "./types.ts";

const getProductGroupURL = (
  origin: string,
  product: ProductBaseNuvemShop,
) => new URL(`/produtos/${getPreferredLanguage(product.handle)}`, origin);

const getProductURL = (
  origin: string,
  product: ProductBaseNuvemShop,
  skuId?: string,
) => {
  const canonicalUrl = getProductGroupURL(origin, product);

  if (skuId) {
    canonicalUrl.searchParams.set("sku", skuId);
  }

  return canonicalUrl;
};

function getVariants(
  product: ProductBaseNuvemShop,
  url: URL,
  sku: string | null,
  level = 0,
) {
  const variants = product
    .variants.filter((variant) =>
      !sku || variant.sku === sku || variant.id.toString() === sku
    )
    .map(
      (variant) => {
        const { values } = variant;
        const name = values.reduce(
          (name, value) => name + " " + getPreferredLanguage(value),
          ``,
        );
        const variantWithName = { ...variant, name: name.trim() };

        const variantUrl = getProductURL(
          url.origin,
          product,
          variant.sku || variant.id.toString(),
        );
        return toProduct(variantWithName, product, variantUrl, level);
      },
    );
  return variants;
}

export function toProduct(
  variant: ProductVariant,
  product: ProductBaseNuvemShop,
  url: URL,
  level = 0,
): Product {
  const { id, product_id, sku, promotional_price, price, values, image_id } =
    variant;
  const variantName = values.reduce(
    (name, value) => name + " " + getPreferredLanguage(value),
    ``,
  );
  const { name, description, images, categories, brand, attributes } = product;
  const variantUrl = new URL(url);

  variantUrl.searchParams.set("sku", sku || id.toString());

  const schemaProduct: Product = {
    "@type": "Product",
    productID: id.toString(),
    sku: sku || id.toString(),
    name: getPreferredLanguage(name) + " " + variantName,
    // NuvemShop description is returned as HTML and special characters and not working properly
    description: getPreferredLanguage(description).replace(
      /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g,
      "",
    ),
    image: images
      .sort((a, _b) => a.id.toString() == image_id ? -1 : 1)
      .map((image: ProductImage) => ({
        "@type": "ImageObject",
        encodingFormat: "image",
        url: image.src,
      })),
    category: getPreferredLanguage(categories[0]?.name || ""), // Assuming there's only one category
    brand: { "@type": "Brand", name: brand ?? undefined },
    offers: {
      "@type": "AggregateOffer" as const,
      priceCurrency: "BRL",
      highPrice: price || 0,
      lowPrice: promotional_price || 0,
      offerCount: 1,
      offers: [getOffer(variant)],
    },
    inProductGroupWithID: product_id?.toString() || "",
    isVariantOf: level === 0
      ? {
        "@type": "ProductGroup",
        url: url.href,
        productGroupID: product_id?.toString() || "",
        hasVariant: getVariants(product, url, null, 1),
        name: getPreferredLanguage(name),
        additionalProperty: [],
      }
      : undefined,
    additionalProperty: getProperties(
      variant,
      attributes,
    ),
    url: getProductURL(url.origin, product, sku || id.toString()).href,
  };

  return schemaProduct;
}

function getOffer(variant: ProductVariant): Offer {
  return {
    "@type": "Offer",
    seller: "NuvemShop",
    inventoryLevel: {
      value: getStockVariant(variant.stock),
    } as QuantitativeValue,
    price: Number(variant.promotional_price) || Number(variant.price) || 0,
    availability: getStockVariant(variant.stock) > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: Number(variant.price) || 0,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: Number(variant.promotional_price) || 0,
      },
    ],
  };
}

function getStockVariant(stock: number | null | undefined): number {
  // NuvemShop returns null when the stock is equal to infinity, so when null
  // is returned i tem has a stock of infinity.
  if (stock === null) return 9999;
  else if (!stock) return 0;
  else return stock;
}

function getPreferredLanguage(
  item: LanguageTypes,
): string {
  if (!item || !item || typeof item !== "object") return "";

  if (item.en) {
    return item.en;
  } else if (item.pt) {
    return item.pt;
  } else if (item.es) {
    return item.es;
  } else {
    return "";
  }
}

function getProperties(
  { values }: ProductVariant,
  attributes: LanguageTypes[],
): PropertyValue[] {
  return values.map((value, index) => ({
    "@type": "PropertyValue" as const,
    name: getPreferredLanguage(attributes[index]),
    value: getPreferredLanguage(value),
  }));
}

function getFilterPriceIntervals(
  products: ProductBaseNuvemShop[],
): PriceInterval[] {
  const prices = products.flatMap((product) =>
    product.variants
      .filter((variant) => variant.price !== undefined)
      .map((variant) => variant.price!)
  );

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const size = 3;
  const intervalSize = (maxPrice - minPrice) / size;

  return Array.from({ length: size }).map((_, index) => {
    const intervalMin = minPrice + index * intervalSize;
    const intervalMax = intervalMin + intervalSize;
    const quantity = products.filter((product) => {
      const productMinPrice = calculateProductMinPrice(product);
      return productMinPrice <= intervalMax && productMinPrice >= intervalMin;
    }).length;

    return {
      minPrice: intervalMin.toFixed(2),
      maxPrice: intervalMax.toFixed(2),
      quantity,
    };
  });
}

function calculateProductMinPrice(product: ProductBaseNuvemShop): number {
  const { variants } = product;

  const { minPrice } = variants.reduce(
    (acc, variant) => {
      const { price } = variant;
      if (price !== undefined) {
        return {
          minPrice: Math.min(acc.minPrice, price),
        };
      }
      return acc;
    },
    { minPrice: Number.MAX_SAFE_INTEGER },
  );

  return minPrice;
}

export function toFilters(
  products: ProductBaseNuvemShop[],
  maxPrice: number,
  minPrice: number,
  url: string,
): Filter[] {
  const priceRange = {
    "@type": "FilterRange" as const,
    label: "Preço",
    key: "price_range",
    values: {
      min: maxPrice,
      max: minPrice,
    },
  };

  const priceIntervals = getFilterPriceIntervals(products);

  const priceToggle = {
    "@type": "FilterToggle" as const,
    label: "Preço",
    key: "price_toggle",
    values: priceIntervals.map((
      { minPrice, maxPrice, quantity },
    ) => ({
      quantity: quantity,
      label: `R$${minPrice} - R$${maxPrice}`,
      value: `${minPrice}`,
      selected: isIntervalSelected(url, minPrice),
      url: getLink(url, minPrice, maxPrice),
    })),
    quantity: products.length,
  };

  return [priceRange, priceToggle];
}

const isIntervalSelected = (url: string, minPrice: string) => {
  const productUrl = new URL(url);
  return productUrl.searchParams.toString().includes(`min_price=${minPrice}`);
};

const getLink = (url: string, minPrice: string, maxPrice: string): string => {
  const productUrl = new URL(url);
  productUrl.searchParams.delete("min_price");
  productUrl.searchParams.delete("max_price");
  productUrl.searchParams.append("min_price", minPrice);
  productUrl.searchParams.append("max_price", maxPrice);

  return productUrl.href;
};

export const getBreadCrumbs = (
  product: ProductBaseNuvemShop,
): ListItem[] => {
  const nuvemUrl = new URL(product.canonical_url);
  const localUrl = new URL(nuvemUrl.pathname, nuvemUrl.origin);

  return [
    ...product.categories.map((category, index) => {
      const position = index + 1;

      return {
        "@type": "ListItem" as const,
        name: getPreferredLanguage(category.name).toLowerCase(),
        item: `/${getPreferredLanguage(category.name).toLowerCase()}`,
        position,
      };
    }),
    {
      "@type": "ListItem",
      name: getPreferredLanguage(product.name),
      item: localUrl.href,
      position: product.categories.length + 1,
    },
  ];
};
