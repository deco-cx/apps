import { HttpError } from "../../../utils/HttpError.ts";
import { FetchOptions, fetchSafe } from "../../../utils/fetch.ts";
import { Props } from "../../mod.ts";
import {
  Banner,
  Coupon,
  OrderForm,
  ProductGroup,
  ProductSearchParams,
  ProductSearchResult,
  RelatedItem,
  RelatedItemTag,
  SEO,
  Shipping,
  TagsSearchParams,
} from "../../utils/client/types.ts";
import { paramsToQueryString } from "../../utils/queryBuilder.ts";
import { getSetCookies } from "std/http/cookie.ts";

export const createClient = (state: Props) => {
  const { publicUrl, sandbox, authToken } = state;
  const publicEndpoint = `https://${publicUrl}`; // TODO: Remove this and use only api endpoints
  const baseUrl = sandbox
    ? "https://api.sandbox.vnda.com.br"
    : "https://api.vnda.com.br";

  const fetcher = (path: string, init?: RequestInit & FetchOptions) =>
    fetchSafe(new URL(path, baseUrl), {
      ...init,
      headers: {
        "User-Agent": "decocx/1.0",
        "X-Shop-Host": publicUrl,
        "accept": "application/json",
        authorization: `Bearer ${authToken}`,
        ...init?.headers,
      },
    });

  const getProduct = (id: string | number): Promise<ProductGroup | null> =>
    fetcher(`/api/v2/products/${id}`, { withProxyCache: true })
      .then((res) => res.json())
      .catch(() => null);

  const searchProduct = async (
    params: ProductSearchParams,
  ): Promise<ProductSearchResult> => {
    const { type_tags, ...knownParams } = params;
    const typeTagsEntries = type_tags?.map((tag) => [tag.key, tag.value]) ?? [];

    const qs = paramsToQueryString({
      ...knownParams,
      ...Object.fromEntries(typeTagsEntries),
    });

    const response = await fetcher(`/api/v2/products/search?${qs}`, {
      withProxyCache: true,
    });

    const data = await response.json();
    const pagination = response.headers.get("x-pagination");

    return {
      ...data,
      pagination: pagination ? JSON.parse(pagination) : {
        total_pages: 0,
        total_count: 0,
        current_page: params.page,
        prev_page: false,
        next_page: false,
      },
    };
  };

  const getDefaultBanner = (): Promise<Banner[]> =>
    fetcher(
      `/api/v2/banners?only_valid=true&tag=listagem-banner-principal`,
      { withProxyCache: true },
    ).then((res) => res.json());

  const getSEO = (type: "Product" | "Page" | "Tag") =>
  (
    resourceId: string | number,
  ): Promise<SEO[]> => {
    const qs = new URLSearchParams();
    qs.set("resource_type", type);
    if (type !== "Tag") qs.set("resource_id", `${resourceId}`);
    if (type === "Tag") qs.set(`code`, `${resourceId}`);
    qs.set("type", "category");

    return fetcher(`/api/v2/seo_data?${qs.toString()}`, {
      withProxyCache: true,
    }).then((res) => res.json());
  };

  const getProductSEO = getSEO("Product");
  const getPageSEO = getSEO("Page");
  const getTagSEO = getSEO("Tag");

  const getTag = (name: string): Promise<RelatedItemTag> =>
    fetcher(`/api/v2/tags/${name}`, { withProxyCache: true })
      .then((res) => res.json());

  const getTags = (params?: TagsSearchParams): Promise<RelatedItemTag[]> => {
    const qs = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      qs.set(key, value);
    });

    return fetcher(`/api/v2/tags?${qs.toString()}`, { withProxyCache: true })
      .then((res) => res.json());
  };

  const getCarrinho = (cookie: string): Promise<OrderForm> =>
    fetcher(new URL("/carrinho", publicEndpoint).href, {
      headers: { cookie },
    }).then((res) => res.json());

  const relatedItems = (cookie: string): Promise<RelatedItem[]> =>
    fetcher(
      new URL(
        "/carrinho/produtos-sugeridos/relacionados-carrinho",
        publicEndpoint,
      ).href,
      { headers: { cookie } },
    ).then((res) => res.json()).catch((error) => {
      if (error instanceof HttpError && error.status === 404) {
        return [];
      }

      throw error;
    });

  const adicionar = async ({
    cookie,
    sku,
    quantity,
    attributes,
  }: {
    cookie: string;
    sku: string;
    quantity: number;
    attributes: Record<string, string>;
  }) => {
    const form = new FormData();
    form.set("sku", sku);
    form.set("quantity", `${quantity}`);

    Object.entries(attributes).forEach(([name, value]) =>
      form.set(`attribute-${name}`, value)
    );

    const response = await fetcher(
      new URL("/carrinho/adicionar", publicEndpoint).href,
      {
        method: "POST",
        body: form,
        headers: { cookie },
      },
    );

    return {
      orderForm: await response.json() as OrderForm,
      cookies: getSetCookies(response.headers),
    };
  };

  const cep = (zip: string, cookie: string): Promise<Shipping> => {
    const form = new FormData();
    form.set("zip", zip);

    return fetcher(new URL("/cep", publicEndpoint).href, {
      method: "POST",
      body: form,
      headers: { cookie },
    })
      .then((res) => res.json());
  };

  const coupon = (code: string, cookie: string): Promise<Coupon> => {
    const form = new FormData();
    form.set("code", code);

    return fetcher(new URL("/cupom/ajax", publicEndpoint).href, {
      method: "POST",
      body: form,
      headers: { cookie },
    }).then((res) => res.json());
  };

  const atualizar = (
    { item_id, quantity }: { item_id: string | number; quantity: number },
    cookie: string,
  ): Promise<OrderForm> =>
    fetcher(new URL("/carrinho/quantidade/atualizar", publicEndpoint).href, {
      method: "POST",
      body: JSON.stringify({ item_id, quantity }),
      headers: { cookie },
    }).then((res) => res.json());

  const remover = (
    item_id: string | number,
    cookie: string,
  ): Promise<OrderForm> =>
    fetcher(new URL("/carrinho/remover", publicEndpoint).href, {
      method: "POST",
      body: JSON.stringify({ item_id }),
      headers: { cookie },
    }).then((res) => res.json());

  return {
    product: {
      search: searchProduct,
      get: getProduct,
    },
    banners: {
      default: getDefaultBanner,
    },
    seo: {
      product: getProductSEO,
      page: getPageSEO,
      tag: getTagSEO,
    },
    tag: getTag,
    tags: getTags,
    carrinho: {
      get: getCarrinho,
      relatedItems,
      adicionar,
      atualizar,
      remover,
    },
    cep,
    coupon,
  };
};
