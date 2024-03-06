import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  getUrl,
  toBreadcrumbList,
  toFilters,
  toProduct,
} from "../utils/transform.ts";
import { WapProductsListPage } from "../utils/type.ts";
import { TypedResponse } from "../../utils/http.ts";

type ORDER_OPTS = "Favoritos" | "Maior Preço" | "Menor Preço" | "Popularidade";

export interface FilterItem {
  /**
   * @title Filter type
   */
  key: string;
  /**
   * @title Filter value
   */
  value: string;
}

export type Props = {
  busca?: string;
  /**
   * @max 100
   * @default 12
   */
  limit?: number;
  /**
   * @description page number
   */
  page?: number;
  /**
   * @description order of products
   */
  order?: ORDER_OPTS;
  /**
   * @title filters
   */
  filterParams?: FilterItem[];
};

const endPoint = {
  "product/listing/category":
    "GET /api/v2/front/url/product/listing/category" as const,
  "product/listing/brand":
    "GET /api/v2/front/url/product/listing/brand" as const,
  "product/listing/landing-page":
    "GET /api/v2/front/url/product/listing/landing-page" as const,
};

/**
 * @title Wap Integration
 * @description Product List loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;
  const url = new URL(baseUrl);

  const rawSearch = url.searchParams.get("busca") ?? props.busca;
  const busca = rawSearch && encodeURIComponent(rawSearch);

  const page = Number(url.searchParams.get("pg") ?? props.page ?? 1);

  const limit = Number(url.searchParams.get("ipp") ?? props.limit ?? 12);

  const order = url.searchParams.get("order") ?? props.order;

  const offset = page <= 1 ? 0 : (page - 1) * limit;

  const filterParams = props.filterParams?.reduce((acc, { key, value }) => {
    if (acc[key]) {
      acc[key] = [...acc[key], value];
    } else {
      acc[key] = value;
    }

    return acc;
  }, {} as Record<string, string | string[]>) ?? {};

  if (!busca && url.pathname.startsWith("%2F_fresh")) return null;

  const { nivel } = await api
    ["GET /api/v2/front/url/verify"]({
      url: url.pathname,
    }).then((response) => response.json()).catch(() => {}) ?? {};

  if (!busca && !nivel) return null;

  const searchParams: Record<string, string | string[]> = {};

  url.searchParams.delete("busca");
  url.searchParams.delete("pg");
  url.searchParams.delete("order");

  url.searchParams.forEach((v, k) => {
    if (searchParams[k]) {
      searchParams[k] = [...searchParams[k], v];
    }
    searchParams[k] = v;
  });

  const params = { ...filterParams, ...searchParams };

  const endpoint = nivel && endPoint[nivel as keyof typeof endPoint];

  const data = endpoint
    ? await api[endpoint]({
      url: url.pathname,
      limit: String(limit),
      offset: String(offset),
      order,
      ...params,
    }).then((response: TypedResponse<unknown>) =>
      response.json()
    ) as WapProductsListPage
    : await api
      ["GET /api/v2/front/url/product/listing/search"]({
        busca,
        limit: String(limit),
        offset: String(offset),
        order,
        ...params,
      }).then((response) => response.json()) as WapProductsListPage;

  const sortOptions = data.conteudo.detalhes.ordenacao.map((order) => (
    {
      label: order.label,
      value: order.rota.query.order!,
    }
  ));

  const itemListElement = toBreadcrumbList(data.estrutura.breadcrumb, baseUrl);

  const filters = toFilters(data.conteudo.detalhes, baseUrl);

  const products = data.conteudo.produtos.map((produto) =>
    toProduct(produto, baseUrl)
  );

  const previousPage = new URL(url);

  previousPage.searchParams.append("pg", String(page - 1));

  const nextPage = new URL(url);

  nextPage.searchParams.append("pg", String(page + 1));

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    sortOptions,
    filters,
    products,
    pageInfo: {
      currentPage: page,
      previousPage: data.info.prev ? previousPage.href : undefined,
      nextPage: data.info.next ? nextPage.href : undefined,
      records: data.info.total,
      recordPerPage: limit,
    },
    seo: {
      title: data.estrutura.seo.title,
      description: data.estrutura.seo.description,
      // TODO canonical
      canonical:
        getUrl(new URL(data.estrutura.seo.canonical).pathname, url.origin).href,
    },
  };
};

export default loader;
