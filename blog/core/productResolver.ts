import { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";

type Source = "vtex" | "shopify" | "wake" | "wap";

const ORDER: Source[] = ["vtex", "shopify", "wake", "wap"];

export interface ProductOption {
  value: string;
  label: string;
  image?: string;
}

function imageUrl(product: Product) {
  const first = product.image?.[0];
  if (!first) return undefined;
  return typeof first === "string" ? first : first.url;
}

function money(product: Product) {
  const low = product.offers?.lowPrice;
  const currency = product.offers?.priceCurrency ?? "BRL";
  if (typeof low !== "number") return undefined;
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(low);
  } catch {
    return `${currency} ${low.toFixed(2)}`;
  }
}

function option(source: Source, product: Product): ProductOption {
  const name = product.name ?? "Unnamed product";
  const price = money(product);
  const label = price ? `${name} - ${price}` : name;

  if (source === "vtex") {
    return {
      value: `vtex:sku:${product.sku || product.productID}`,
      label,
      image: imageUrl(product),
    };
  }

  if (source === "shopify") {
    const handle = extractHandle(product.url) ?? product.productID;
    return {
      value: `shopify:handle:${handle}`,
      label,
      image: imageUrl(product),
    };
  }

  if (source === "wake") {
    return {
      value: `wake:product:${product.productID}`,
      label,
      image: imageUrl(product),
    };
  }

  return {
    value: `wap:product:${product.productID}`,
    label,
    image: imageUrl(product),
  };
}

function extractHandle(url?: string) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const i = parts.findIndex((part) => part === "products");
    return i >= 0 ? parts[i + 1] : parts.at(-1);
  } catch {
    return undefined;
  }
}

async function searchVtex(
  term: string,
  ctx: AppContext,
): Promise<ProductOption[]> {
  const res = await (ctx as unknown as {
    invoke: {
      vtex: {
        loaders: {
          intelligentSearch: {
            suggestions: (
              props: { query: string; count: number },
            ) => Promise<{ products?: Product[] }>;
          };
        };
      };
    };
  }).invoke.vtex.loaders.intelligentSearch.suggestions({
    query: term,
    count: 10,
  });

  return (res?.products ?? []).map((p) => option("vtex", p));
}

async function searchShopify(
  term: string,
  req: Request,
  ctx: AppContext,
): Promise<ProductOption[]> {
  const res = await (ctx as unknown as {
    invoke: {
      shopify: {
        loaders: {
          ProductList: (
            props: { props: { query: string; count: number } },
            req: Request,
          ) => Promise<Product[] | null>;
        };
      };
    };
  }).invoke.shopify.loaders.ProductList(
    { props: { query: term, count: 10 } },
    req,
  );

  return (res ?? []).map((p) => option("shopify", p));
}

async function searchWake(
  term: string,
  req: Request,
  ctx: AppContext,
): Promise<ProductOption[]> {
  const res = await (ctx as unknown as {
    invoke: {
      wake: {
        loaders: {
          suggestion: (
            props: { query: string; limit?: number },
            req: Request,
          ) => Promise<{ products?: Product[] } | null>;
        };
      };
    };
  }).invoke.wake.loaders.suggestion({ query: term, limit: 10 }, req);

  return (res?.products ?? []).map((p) => option("wake", p));
}

async function searchWap(
  term: string,
  req: Request,
  ctx: AppContext,
): Promise<ProductOption[]> {
  const res = await (ctx as unknown as {
    invoke: {
      wap: {
        loaders: {
          suggestions: (
            props: { query?: string; count?: number },
            req: Request,
          ) => Promise<{ products?: Product[] } | null>;
        };
      };
    };
  }).invoke.wap.loaders.suggestions({ query: term, count: 10 }, req);

  return (res?.products ?? []).map((p) => option("wap", p));
}

export async function searchProductOptions(
  term: string,
  req: Request,
  ctx: AppContext,
): Promise<ProductOption[]> {
  const query = term.trim();

  // When the current form value is already a stored reference (e.g. vtex:sku:123),
  // resolve and return it as an option so DynamicOptions can keep the selected item visible.
  const selected = parseReference(query);
  if (selected) {
    const resolved = await resolveProductByReference(query, req, ctx);
    if (resolved) {
      const base = option(selected.source, resolved);
      return [{
        ...base,
        value: query,
      }];
    }
  }

  const candidates = ORDER;

  for (const source of candidates) {
    try {
      const options = source === "vtex"
        ? await searchVtex(query, ctx)
        : source === "shopify"
        ? await searchShopify(query || "*", req, ctx)
        : source === "wake"
        ? await searchWake(query, req, ctx)
        : await searchWap(query, req, ctx);

      if (options.length > 0) return options;
    } catch {
      // continue with next candidate
    }
  }

  if (!query) {
    return [{
      value: "",
      label: "Type to search products",
    }];
  }

  return [{
    value: "",
    label: "No products found",
  }];
}

function parseReference(
  value: string,
): { source: Source; kind: string; id: string } | null {
  const m = value.match(/^([a-z]+):([a-z]+):(.+)$/i);
  if (!m) return null;
  const source = m[1].toLowerCase() as Source;
  const kind = m[2].toLowerCase();
  const id = m[3];
  if (!ORDER.includes(source)) return null;
  return { source, kind, id };
}

async function resolveVtex(
  id: string,
  req: Request,
  ctx: AppContext,
): Promise<Product | null> {
  const products = await (ctx as unknown as {
    invoke: {
      vtex: {
        loaders: {
          intelligentSearch: {
            productList: (
              props: { props: { ids: string[] } },
              req: Request,
            ) => Promise<Product[] | null>;
          };
        };
      };
    };
  }).invoke.vtex.loaders.intelligentSearch.productList(
    { props: { ids: [id] } },
    req,
  );

  return products?.[0] ?? null;
}

async function resolveShopify(
  id: string,
  kind: string,
  req: Request,
  ctx: AppContext,
): Promise<Product | null> {
  const slug = kind === "handle" ? id : extractHandle(id) ?? id;
  const page = await (ctx as unknown as {
    invoke: {
      shopify: {
        loaders: {
          ProductDetailsPage: (
            props: { slug: string },
            req: Request,
          ) => Promise<{ product: Product } | null>;
        };
      };
    };
  }).invoke.shopify.loaders.ProductDetailsPage({ slug }, req);

  return page?.product ?? null;
}

async function resolveWake(
  id: string,
  req: Request,
  ctx: AppContext,
): Promise<Product | null> {
  const productId = Number(id);
  if (!Number.isFinite(productId)) return null;

  const products = await (ctx as unknown as {
    invoke: {
      wake: {
        loaders: {
          productList: (props: {
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
          }, req: Request) => Promise<Product[] | null>;
        };
      };
    };
  }).invoke.wake.loaders.productList({
    first: 1,
    sortDirection: "ASC",
    sortKey: "NAME",
    filters: { productId: [productId] },
  }, req);

  return products?.[0] ?? null;
}

async function resolveWap(
  id: string,
  req: Request,
  ctx: AppContext,
): Promise<Product | null> {
  const products = await (ctx as unknown as {
    invoke: {
      wap: {
        loaders: {
          productList: (
            props: { props: { busca: string; limit: number } },
            req: Request,
          ) => Promise<Product[] | null>;
        };
      };
    };
  }).invoke.wap.loaders.productList({ props: { busca: id, limit: 1 } }, req);

  return products?.[0] ?? null;
}

export async function resolveProductByReference(
  reference: string | undefined,
  req: Request,
  ctx: AppContext,
): Promise<Product | null> {
  if (!reference) return null;
  const parsed = parseReference(reference);
  if (!parsed) return null;

  try {
    if (parsed.source === "vtex") return await resolveVtex(parsed.id, req, ctx);
    if (parsed.source === "shopify") {
      return await resolveShopify(parsed.id, parsed.kind, req, ctx);
    }
    if (parsed.source === "wake") return await resolveWake(parsed.id, req, ctx);
    return await resolveWap(parsed.id, req, ctx);
  } catch {
    return null;
  }
}
