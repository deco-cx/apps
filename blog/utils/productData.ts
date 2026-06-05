import { Product } from "../../commerce/types.ts";

function toMoney(value: number | undefined, currency = "BRL") {
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

export function getProductImage(product: Product): string | undefined {
  const image = product.image?.[0];
  if (!image) return undefined;
  if (typeof image === "string") return image;
  return image.url;
}

export function getProductPrices(product: Product) {
  const currency = product.offers?.priceCurrency ?? "BRL";
  const low = product.offers?.lowPrice;
  const high = product.offers?.highPrice;

  const price = toMoney(low, currency);
  const listPrice =
    typeof high === "number" && typeof low === "number" && high > low
      ? toMoney(high, currency)
      : undefined;

  return { price, listPrice };
}
