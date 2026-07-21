/**
 * Coerces persisted `product` / `products` block props into commerce Products.
 *
 * Canonical format: string or string[] as `platform:kind:id` (e.g. `vtex:product:123`).
 * Loader-ref and pre-resolved Product shapes are tolerated for Studio / block-graph compat.
 */
import type { Product } from "../../commerce/types.ts";
import {
  resolveProductByReference,
  resolveProductsByReference,
} from "./productResolver.ts";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Block graph already resolved a nested loader to a Product. */
export function isResolvedProduct(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    !("__resolveType" in value) &&
    ("productID" in value || "sku" in value ||
      ("name" in value && "offers" in value))
  );
}

function idString(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

/**
 * Extract canonical or plain product reference strings from persisted block
 * values: `vtex:product:123`, loader-ref shapes, or plain numeric IDs.
 */
export function referencesFromProductInput(value: unknown): string[] {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (isResolvedProduct(value)) {
    return [];
  }

  if (Array.isArray(value)) {
    if (value.length > 0 && isResolvedProduct(value[0])) {
      return [];
    }
    if (value.every((item) => typeof item === "string")) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
    return value.flatMap((item) => referencesFromProductInput(item));
  }

  const existing = asRecord(value);
  if (!existing) return [];

  const props = asRecord(existing.props);
  if (props && Array.isArray(props.ids)) {
    return props.ids.map(idString).filter(Boolean);
  }

  if ("productId" in existing) {
    const id = idString(existing.productId);
    return id ? [id] : [];
  }

  return [];
}

export async function coerceProduct(
  value: unknown,
  req: Request,
  ctx: unknown,
): Promise<Product | null> {
  if (value == null) return null;

  if (isResolvedProduct(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    const resolved = value.find(isResolvedProduct);
    if (resolved) return resolved;
  }

  const refs = referencesFromProductInput(value);
  if (refs.length === 0) return null;

  return await resolveProductByReference(refs[0], req, ctx);
}

export async function coerceProducts(
  value: unknown,
  req: Request,
  ctx: unknown,
): Promise<Product[]> {
  if (value == null) return [];

  if (
    Array.isArray(value) && value.length > 0 && value.every(isResolvedProduct)
  ) {
    return value;
  }

  const refs = referencesFromProductInput(value);
  if (refs.length === 0) return [];

  return await resolveProductsByReference(refs, req, ctx);
}
