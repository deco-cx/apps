import { Filter, ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { search, Sort } from "../../utils/product.ts";

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

  /** @description Full text search query */
  term?: string;

  /**
   * @title Apply and operator between facets
   * @description default and
   */
  operator?: "and" | "or";

  /** @description Enable to highlight matched terms */
  highlight?: boolean;

  /**
   * @description Remove facets. facetGroups. in facet names for improving UI display
   */
  rawFacetLabels?: boolean;
}

const getPageInfo = (page: number, nbPages: number, url: URL) => {
  const next = page + 1;
  const prev = page - 1;
  const hasNextPage = next < nbPages;
  const hasPreviousPage = prev >= 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", `${next}`);
  }

  if (hasPreviousPage) {
    previousPage.set("page", `${prev}`);
  }

  return {
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
    currentPage: page,
  };
};

interface Facet {
  counts: { count: number; highlighted: string; value: string }[];
  field_name: string;
  sampled?: boolean;
}

const transformFacets = (
  facets: Facet[] = [],
  options: {
    filterBy: string;
    operator: "&&" | "||";
    url: URL;
    rawLabels: boolean;
  },
): Filter[] => {
  const { filterBy, operator, url, rawLabels } = options;
  const params = new URLSearchParams(url.searchParams);
  const filters = filterBy.split(operator).map((x) => x.trim()).filter(Boolean);

  return facets.map(({ field_name, counts }) => ({
    "@type": "FilterToggle",
    quantity: 0,
    label: rawLabels
      ? field_name
      : field_name.replace("facets.", "").replace("groupFacets.", ""),
    key: field_name,
    values: counts.map(({ count, value }) => {
      const facet = `${field_name}:=${value}`;
      const index = filters.findIndex((f) => f === facet);
      const selected = index > -1;
      const newFilters = [...filters];

      if (selected) {
        newFilters.splice(index, 1);
      } else {
        newFilters.push(facet);
      }

      params.set("filters", newFilters.join(operator));

      return {
        value,
        quantity: count,
        label: value,
        selected,
        url: `?${params}`,
      };
    }),
  }));
};

const sortFacets = (filters: Filter[], order?: string[]) => {
  if (!order || order.length === 0) {
    return filters;
  }

  return order
    .map((o) => filters.find((f) => f.key === o))
    .filter((f): f is Filter => Boolean(f));
};

export const getSort = (sort: string | null): Sort | undefined => {
  if (sort === "isVariantOf.name:asc") {
    return "isVariantOf.name:asc";
  }
  if (sort === "isVariantOf.name:desc") {
    return "isVariantOf.name:desc";
  }
  if (sort === "offers.lowPrice:asc") {
    return "offers.lowPrice:asc";
  }
  if (sort === "offers.lowPrice:desc") {
    return "offers.lowPrice:desc";
  }

  return;
};

/**
 * @title Typesense Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);

  const index = await ctx.products();
  const filterBy = url.searchParams.get("filters") ?? undefined;
  const perPage = props.hitsPerPage ?? 12;
  const q = props.term ?? url.searchParams.get("q") ??
    url.searchParams.get("query") ?? "*";
  const page = Number(url.searchParams.get("page")) || 0;
  const operator = props.operator === "or" ? "||" : "&&";
  const sort = getSort(url.searchParams.get("sort"));

  const { products, found, facet_counts = [] } = await search(
    {
      q,
      page,
      sort_by: sort,
      per_page: perPage,
      filter_by: filterBy,
      highlight: props.highlight,
    },
    index,
    url,
  );

  const pageInfo = getPageInfo(page, Math.ceil(found / perPage), url);
  const filters = transformFacets(facet_counts, {
    rawLabels: props.rawFacetLabels || false,
    filterBy: filterBy ?? "",
    operator,
    url,
  });

  return {
    "@type": "ProductListingPage",
    // TODO: Find out what's the right breadcrumb on typesense
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: sortFacets(filters, props.facets),
    products: products || [],
    pageInfo,
    sortOptions: [
      {
        value: "",
        label: "Relevance",
      },
      {
        value: "isVariantOf.name:asc",
        label: "Name - A-Z",
      },
      {
        value: "isVariantOf.name:desc",
        label: "Name - Z-A",
      },
      {
        value: "offers.lowPrice:asc",
        label: "Price - Lower to Higher",
      },
      {
        value: "offers.lowPrice:desc",
        label: "Price - Higher to Lower",
      },
    ],
  };
};

export default loader;
