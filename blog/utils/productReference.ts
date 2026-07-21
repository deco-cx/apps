type ProductPlatform = "vtex" | "shopify" | "wake" | "wap";
type ProductReferenceKind = "sku" | "product" | "handle";

export interface ParsedProductReference {
  platform: ProductPlatform;
  kind: ProductReferenceKind;
  id: string;
}

const PRODUCT_REF_RE = /^([a-z]+):([a-z]+):(.+)$/i;

export const PLATFORM_ORDER: ProductPlatform[] = [
  "vtex",
  "shopify",
  "wake",
  "wap",
];

export function parseReference(
  value: string,
): ParsedProductReference | null {
  const match = value.match(PRODUCT_REF_RE);
  if (!match) return null;

  const platform = match[1].toLowerCase() as ProductPlatform;
  const kind = match[2].toLowerCase() as ProductReferenceKind;
  const id = match[3];

  if (!PLATFORM_ORDER.includes(platform)) return null;
  return { platform, kind, id };
}

export function formatReference(
  platform: ProductPlatform,
  kind: ProductReferenceKind,
  id: string,
): string {
  return `${platform}:${kind}:${id}`;
}

export function normalizeReference(
  raw: string,
  platform?: ProductPlatform | null,
): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (parseReference(trimmed)) return trimmed;
  if (!platform) return null;

  if (platform === "vtex") {
    if (/^\d+$/.test(trimmed)) {
      return formatReference("vtex", "product", trimmed);
    }
    return trimmed;
  }

  if (platform === "shopify") {
    return formatReference("shopify", "handle", trimmed);
  }

  if (platform === "wake" || platform === "wap") {
    return formatReference(platform, "product", trimmed);
  }

  return null;
}

export type { ProductPlatform, ProductReferenceKind };
