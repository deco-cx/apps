import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";
import type { ImageObject, Offer, Product } from "../../commerce/types.ts";
import { sanitizeHref } from "./sanitizeHtml.ts";

const SCHEMA_LIST_PRICE = "https://schema.org/ListPrice";
const SCHEMA_SALE_PRICE = "https://schema.org/SalePrice";

function formatMoney(value: number | undefined, currency = "BRL") {
  if (typeof value !== "number" || Number.isNaN(value)) return undefined;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function priceFromSpecifications(
  offers: Offer[],
  priceType: string,
): number | undefined {
  for (const offer of offers) {
    const match = offer.priceSpecification?.find((spec) =>
      spec.priceType === priceType
    );
    if (typeof match?.price === "number") return match.price;
  }
  return undefined;
}

export function getProductImage(product: Product): string {
  const image = product.image?.[0];
  if (!image) return DEFAULT_IMAGE.url ?? "";
  if (typeof image === "string") return image;
  return (image as ImageObject).url ?? DEFAULT_IMAGE.url ?? "";
}

export function getProductPrices(product: Product) {
  const currency = product.offers?.priceCurrency ?? "BRL";
  const nestedOffers = product.offers?.offers ?? [];

  const salePrice = product.offers?.lowPrice ??
    priceFromSpecifications(nestedOffers, SCHEMA_SALE_PRICE) ??
    nestedOffers[0]?.price;

  const listPriceValue = priceFromSpecifications(
    nestedOffers,
    SCHEMA_LIST_PRICE,
  );

  const price = formatMoney(salePrice, currency);
  const listPrice = typeof listPriceValue === "number" &&
      typeof salePrice === "number" &&
      listPriceValue > salePrice
    ? formatMoney(listPriceValue, currency)
    : undefined;

  return { price, listPrice };
}

export function getProductImageDimensions(product: Product): {
  width: number;
  height: number;
} {
  const image = product.image?.[0];
  if (image && typeof image !== "string") {
    const width = Number((image as ImageObject & { width?: number }).width);
    const height = Number((image as ImageObject & { height?: number }).height);
    if (width > 0 && height > 0) return { width, height };
  }
  return { width: 600, height: 600 };
}

export function getProductLink(product: Product) {
  const safeUrl = sanitizeHref(product.url);
  return {
    safeUrl,
    isExternal: /^https?:\/\//i.test(safeUrl),
  };
}

export function getProductDisplay(product: Product) {
  const name = product.name ?? "";
  const { width, height } = getProductImageDimensions(product);
  const { price, listPrice } = getProductPrices(product);
  const { safeUrl, isExternal } = getProductLink(product);

  return {
    name,
    imageUrl: getProductImage(product),
    width,
    height,
    price,
    listPrice,
    safeUrl,
    isExternal,
  };
}
