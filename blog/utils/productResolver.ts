import type { Product } from "../../commerce/types.ts";
import {
  formatReference,
  normalizeReference,
  parseReference,
  PLATFORM_ORDER,
  type ProductPlatform,
} from "./productReference.ts";
import { getProductDisplay, getProductImage } from "./productData.ts";

export interface ProductOption {
  value: string;
  label: string;
  image?: string;
}

type InvokeSurface = {
  vtex?: {
    loaders: {
      intelligentSearch: {
        suggestions: (
          props: { query: string; count: number },
        ) => Promise<{ products?: Product[] }>;
        productList: (
          props: { props: Record<string, unknown> },
          req: Request,
        ) => Promise<Product[] | null>;
      };
      legacy: {
        productList: (
          props: { props: Record<string, unknown> },
          req: Request,
        ) => Promise<Product[] | null>;
      };
    };
  };
  shopify?: {
    loaders: {
      ProductList: (
        props: { props: { query: string; count: number } },
        req: Request,
      ) => Promise<Product[] | null>;
      ProductDetailsPage: (
        props: { slug: string },
        req: Request,
      ) => Promise<{ product: Product } | null>;
    };
  };
  wake?: {
    loaders: {
      suggestion: (
        props: { query: string; limit?: number },
        req: Request,
      ) => Promise<{ products?: Product[] } | null>;
      productList: (
        props: {
          first: number;
          sortDirection: "ASC" | "DESC";
          sortKey:
            | "NAME"
            | "PRICE"
            | "DISCOUNT"
            | "RANDOM"
            | "RELEASE_DATE"
            | "SALES"
            | "STOCK";
          filters: { productId: number[] };
        },
        req: Request,
      ) => Promise<Product[] | null>;
    };
  };
  wap?: {
    loaders: {
      suggestions: (
        props: { query?: string; count?: number },
        req: Request,
      ) => Promise<{ products?: Product[] } | null>;
      productList: (
        props: { props: { busca: string; limit: number } },
        req: Request,
      ) => Promise<Product[] | null>;
    };
  };
};

const platformBySite = new Map<string, ProductPlatform | null>();

function siteKey(req: Request): string {
  return new URL(req.url).origin;
}

function invoke(ctx: unknown): InvokeSurface {
  return (ctx as { invoke: InvokeSurface }).invoke;
}

function hasInvokePlatform(
  inv: InvokeSurface,
  platform: ProductPlatform,
): boolean {
  if (platform === "vtex") return !!inv.vtex;
  if (platform === "shopify") return !!inv.shopify;
  if (platform === "wake") return !!inv.wake;
  return !!inv.wap;
}

function extractHandle(url?: string) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const index = parts.findIndex((part) => part === "products");
    return index >= 0 ? parts[index + 1] : parts.at(-1);
  } catch {
    return undefined;
  }
}

function toOption(platform: ProductPlatform, product: Product): ProductOption {
  const { name, price, imageUrl } = getProductDisplay(product);
  const label = price ? `${name} - ${price}` : name;

  if (platform === "vtex") {
    return {
      value: formatReference("vtex", "product", product.productID),
      label,
      image: imageUrl,
    };
  }

  if (platform === "shopify") {
    const handle = extractHandle(product.url) ?? product.productID;
    return {
      value: formatReference("shopify", "handle", handle),
      label,
      image: imageUrl,
    };
  }

  return {
    value: formatReference(platform, "product", product.productID),
    label,
    image: imageUrl,
  };
}

async function probePlatform(
  platform: ProductPlatform,
  ctx: unknown,
  req: Request,
): Promise<boolean> {
  try {
    const inv = invoke(ctx);
    if (!hasInvokePlatform(inv, platform)) return false;

    if (platform === "vtex") {
      const res = await inv.vtex!.loaders.intelligentSearch.suggestions({
        query: "a",
        count: 1,
      });
      return (res?.products?.length ?? 0) > 0;
    }
    if (platform === "shopify") {
      const res = await inv.shopify!.loaders.ProductList(
        { props: { query: "*", count: 1 } },
        req,
      );
      return Array.isArray(res);
    }
    if (platform === "wake") {
      const res = await inv.wake!.loaders.suggestion(
        { query: "a", limit: 1 },
        req,
      );
      return (res?.products?.length ?? 0) > 0;
    }
    const res = await inv.wap!.loaders.suggestions(
      { query: "a", count: 1 },
      req,
    );
    return (res?.products?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

async function detectPlatform(
  ctx: unknown,
  req: Request,
): Promise<ProductPlatform | null> {
  for (const platform of PLATFORM_ORDER) {
    if (await probePlatform(platform, ctx, req)) return platform;
  }
  return null;
}

async function getPlatform(
  ctx: unknown,
  req: Request,
): Promise<ProductPlatform | null> {
  const key = siteKey(req);
  if (platformBySite.has(key)) {
    return platformBySite.get(key) ?? null;
  }
  const platform = await detectPlatform(ctx, req);
  platformBySite.set(key, platform);
  return platform;
}

async function searchPlatform(
  platform: ProductPlatform,
  term: string,
  ctx: unknown,
  req: Request,
): Promise<ProductOption[]> {
  const inv = invoke(ctx);

  if (platform === "vtex") {
    const res = await inv.vtex!.loaders.intelligentSearch.suggestions({
      query: term,
      count: 10,
    });
    return (res?.products ?? []).map((product) => toOption("vtex", product));
  }

  if (platform === "shopify") {
    const res = await inv.shopify!.loaders.ProductList(
      { props: { query: term || "*", count: 10 } },
      req,
    );
    return (res ?? []).map((product) => toOption("shopify", product));
  }

  if (platform === "wake") {
    const res = await inv.wake!.loaders.suggestion(
      { query: term, limit: 10 },
      req,
    );
    return (res?.products ?? []).map((product) => toOption("wake", product));
  }

  const res = await inv.wap!.loaders.suggestions(
    { query: term, count: 10 },
    req,
  );
  return (res?.products ?? []).map((product) => toOption("wap", product));
}

async function resolvePlatform(
  platform: ProductPlatform,
  kind: string,
  id: string,
  ctx: unknown,
  req: Request,
): Promise<Product | null> {
  const inv = invoke(ctx);

  if (platform === "vtex") {
    if (kind === "product") {
      const products = await inv.vtex!.loaders.legacy.productList(
        { props: { productIds: [id] } },
        req,
      );
      return products?.[0] ?? null;
    }
    if (kind === "sku") {
      const products = await inv.vtex!.loaders.intelligentSearch.productList(
        { props: { ids: [id] } },
        req,
      );
      return products?.[0] ?? null;
    }
    const products = await inv.vtex!.loaders.intelligentSearch.productList(
      { props: { query: id, count: 1 } },
      req,
    );
    return products?.[0] ?? null;
  }

  if (platform === "shopify") {
    const slug = kind === "handle" ? id : extractHandle(id) ?? id;
    const page = await inv.shopify!.loaders.ProductDetailsPage({ slug }, req);
    return page?.product ?? null;
  }

  if (platform === "wake") {
    const productId = Number(id);
    if (!Number.isFinite(productId)) return null;
    const products = await inv.wake!.loaders.productList({
      first: 1,
      sortDirection: "ASC",
      sortKey: "NAME",
      filters: { productId: [productId] },
    }, req);
    return products?.[0] ?? null;
  }

  const products = await inv.wap!.loaders.productList(
    { props: { busca: id, limit: 1 } },
    req,
  );
  return products?.[0] ?? null;
}

export async function searchProductOptions(
  term: string,
  req: Request,
  ctx: unknown,
): Promise<ProductOption[]> {
  const query = term.trim();
  const parsed = parseReference(query);

  if (parsed) {
    const resolved = await resolveProductByReference(query, req, ctx);
    if (resolved) {
      const { name, price } = getProductDisplay(resolved);
      return [{
        value: query,
        label: price ? `${name} - ${price}` : name,
        image: getProductImage(resolved),
      }];
    }
  }

  const platform = await getPlatform(ctx, req);
  if (!platform) {
    return query
      ? [{ value: "", label: "No commerce platform installed" }]
      : [{ value: "", label: "Type to search products" }];
  }

  try {
    const options = await searchPlatform(platform, query, ctx, req);
    if (options.length > 0) return options;
  } catch (error) {
    console.warn(
      `[productResolver:${platform}]`,
      error instanceof Error ? error.message : error,
    );
  }

  if (!query) {
    return [{ value: "", label: "Type to search products" }];
  }

  return [{ value: "", label: "No products found" }];
}

export async function resolveProductByReference(
  reference: string | undefined,
  req: Request,
  ctx: unknown,
  platformHint?: ProductPlatform | null,
): Promise<Product | null> {
  if (!reference?.trim()) return null;

  const raw = reference.trim();
  const parsed = parseReference(raw);

  if (parsed) {
    try {
      return await resolvePlatform(
        parsed.platform,
        parsed.kind,
        parsed.id,
        ctx,
        req,
      );
    } catch (error) {
      console.warn(
        `[productResolver:${parsed.platform}]`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  const platform = platformHint === undefined
    ? await getPlatform(ctx, req)
    : platformHint;
  if (!platform) return null;

  const normalized = normalizeReference(raw, platform);
  if (!normalized) return null;

  if (normalized === raw) {
    try {
      return await resolvePlatform(platform, "product", raw, ctx, req);
    } catch (error) {
      console.warn(
        `[productResolver:${platform}]`,
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  return await resolveProductByReference(normalized, req, ctx, platform);
}

export async function resolveProductsByReference(
  references: string[],
  req: Request,
  ctx: unknown,
): Promise<Product[]> {
  const platform = await getPlatform(ctx, req);
  const resolved = await Promise.all(
    references.map((reference) =>
      resolveProductByReference(reference, req, ctx, platform)
    ),
  );
  return resolved.filter((product): product is Product => Boolean(product));
}
