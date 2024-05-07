import { Filter, ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { getPageInfo, toProduct } from "../utils/transform.ts";
import { MappedOf } from "../../website/loaders/mapped.ts";
import { AlgoliaV2 } from "../../algolia/utils/types.ts";

/** @titleBy label */
interface Facet {
  /**
   * @title Facet Name
   * @description These are the facet names available at Algolia dashboard > search > index */
  name: string;

  /** @description Facet label to be rendered on the site UI */
  label: string;
}

// Transforms facets and re-orders so they match what's configured on deco admin
const transformFacets = (
  facets: Record<string, Record<string, number>>,
  options: { order: Facet[]; facetFilters: [string, string[]][]; url: URL },
): Filter[] => {
  const { facetFilters, url, order } = options;
  const params = new URLSearchParams(url.searchParams);
  const filters = Object.fromEntries(facetFilters);
  const orderByKey = new Map(
    order.map(({ name, label }, index) => [name, { label, index }]),
  );
  const entries = Object.entries(facets);

  const transformed: Filter[] = new Array(entries.length);
  for (let it = 0; it < entries.length; it++) {
    const [key, values] = entries[it];
    const filter = filters[key] ?? [];
    let index: number | undefined = it;
    let label: string | undefined = key;

    // Apply sort only when user set facets on deco admin
    if (orderByKey.size > 0) {
      index = orderByKey.get(key)?.index;
      label = orderByKey.get(key)?.label;
    }

    if (index === undefined || label === undefined) continue;

    transformed[index] = {
      "@type": "FilterToggle",
      quantity: 0,
      label,
      key,
      values: Object.entries(values).map(([value, quantity]) => {
        const index = filter.findIndex((f) => f === value);
        const selected = index > -1;
        const newFilter = selected
          ? {
            ...filters,
            [key]: [...filter].filter((f) => f !== value),
          }
          : {
            ...filters,
            [key]: [...filter, value],
          };

        if (newFilter[key].length === 0) {
          delete newFilter[key];
        }

        params.set("facetFilters", JSON.stringify(Object.entries(newFilter)));

        return {
          value,
          quantity,
          label: value,
          selected,
          url: `?${params}`,
        };
      }),
    };
  }

  return transformed.filter(Boolean);
};

/**
 * @title Algolia Integration
 */
const loader = (
  _props: unknown,
  req: Request,
  _ctx: AppContext,
): MappedOf<AlgoliaV2, ProductListingPage | null> => {
  const url = new URL(req.url);
  return (
    { results, facetFilters, startingPage, props: AlogliaProps }: AlgoliaV2,
  ) => {
    const [
      { hits, page, nbPages, nbHits, hitsPerPage },
      { facets },
    ] = results;

    const pageInfo = getPageInfo(
      page,
      nbPages,
      nbHits,
      hitsPerPage,
      url,
      startingPage ?? 0,
    );

    const filters = transformFacets(facets ?? {}, {
      order: AlogliaProps.facets ?? [],
      facetFilters,
      url,
    });

    const products = hits.map((product) => {
      return toProduct(product, {
        url,
        priceCurrency: "BRL",
      });
    });

    return {
      "@type": "ProductListingPage",
      // TODO: Find out what's the right breadcrumb on algolia
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      },
      filters,
      products,
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
};

export default loader;
