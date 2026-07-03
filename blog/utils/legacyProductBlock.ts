import { sanitizeHref } from "./sanitizeHtml.ts";

export interface LegacyProductFields {
  name?: string;
  price?: string;
  listPrice?: string;
  imageUrl?: string;
  url?: string;
}

export interface LegacyShelfItem extends LegacyProductFields {
  badge?: string;
}

export interface LegacyProductDisplay {
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  price?: string;
  listPrice?: string;
  safeUrl: string;
  isExternal: boolean;
}

export function hasLegacyProductFields(
  props: LegacyProductFields,
): boolean {
  return Boolean(props.name?.trim());
}

export function getLegacyProductDisplay(
  props: LegacyProductFields,
): LegacyProductDisplay | null {
  const name = props.name?.trim() ?? "";
  if (!name) return null;

  const safeUrl = sanitizeHref(props.url);
  return {
    name,
    imageUrl: props.imageUrl ?? "",
    width: 600,
    height: 600,
    price: props.price,
    listPrice: props.listPrice,
    safeUrl,
    isExternal: /^https?:\/\//i.test(safeUrl),
  };
}

export function parseLegacyShelfItems(
  items: LegacyShelfItem[] | string | undefined,
): LegacyShelfItem[] {
  if (Array.isArray(items)) {
    return items.filter((item) => Boolean(item?.name?.trim()));
  }

  if (typeof items === "string" && items.trim()) {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => Boolean(item?.name?.trim()));
      }
    } catch {
      /* ignore invalid JSON */
    }
  }

  return [];
}
