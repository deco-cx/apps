import { Filter, ProductListingPage } from "../../commerce/types.ts";
import { AppContext, Indices } from "../mod.ts";
import { IndexedProduct, resolveProducts } from "../utils/product.ts";

interface Props {
  /**
   * @title Count
   * @description Max number of products to return
   */
  hitsPerPage: number;

  /**
   * @title Display Facets
   * @description List of facet names to render on the website
   */
  facets?: string[];

  /**
   * @description https://www.algolia.com/doc/api-reference/api-parameters/sortFacetValuesBy/
   */
  sortFacetValuesBy?: "count" | "alpha";

  /** @description Full text search query */
  term?: string;
}

const getPageInfo = (page: number, nbPages: number, url: URL) => {
  const hasNextPage = page < nbPages;
  const hasPreviousPage = page > 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

  return {
    nextPage: hasNextPage ? nextPage.toString() : undefined,
    previousPage: hasPreviousPage ? previousPage.toString() : undefined,
    currentPage: page,
  };
};

const transformFacets = (
  facets: Record<string, Record<string, number>> = {},
  facetFilters: string[],
  url: URL,
): Filter[] => {
  const params = new URLSearchParams(url.searchParams);
  const filters = new Map(
    Object.entries(facetFilters).map(([key, value]) => [value, Number(key)]),
  );

  return Object.entries(facets).map(([key, values]) => ({
    "@type": "FilterToggle",
    quantity: 0,
    label: key.replace("additionalProperty.", ""),
    key,
    values: Object.entries(values).map(([value, quantity]) => {
      const facet = `${key}:${value}`;
      const index = filters.get(facet);
      const selected = typeof index === "number";
      const newFilters = [...facetFilters];

      if (selected) {
        typeof index === "number" && newFilters.splice(index, 1);
      } else {
        newFilters.push(facet);
      }

      params.set("facetFilters", JSON.stringify(newFilters));

      return {
        value,
        quantity,
        label: value,
        selected,
        url: `?${params}`,
      };
    }),
  }));
};

const getIndex = (options: string | null): Indices => {
  switch (options) {
    case "relevance":
      return "products";
    case "price_asc":
      return "products_price_asc";
    case "price_desc":
      return "products_price_desc";
    default:
      return "products";
  }
};

/**
 * @title Algolia Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { algolia } = ctx;
  const url = new URL(req.url);

  const index = await algolia(getIndex(url.searchParams.get("sort")));
  const facetFilters = JSON.parse(url.searchParams.get("facetFilters") ?? "[]");

  const { hits, page, nbPages, facets } = await index.search<
    IndexedProduct
  >(
    props.term ?? url.searchParams.get("query") ?? "",
    {
      facetFilters,
      facets: props.facets || ["*"],
      hitsPerPage: props.hitsPerPage ?? 12,
      page: Number(url.searchParams.get("page")) || 0,
      sortFacetValuesBy: props.sortFacetValuesBy,
    },
  );

  const products = await resolveProducts(hits, index);
  const pageInfo = getPageInfo(page, nbPages, url);
  const filters = transformFacets(facets, facetFilters, url);

  return {
    "@type": "ProductListingPage",
    // TODO: Find out what's the right breadcrumb on algolia
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters,
    products: products,
    pageInfo,
    sortOptions: [
      {
        value: "relevance",
        label: "Relevance",
      },
      {
        value: "price_asc",
        label: "Price - Lower to Higher",
      },
      {
        value: "price_desc",
        label: "Price - Higher to Lower",
      },
    ],
  };
};

export default loader;
