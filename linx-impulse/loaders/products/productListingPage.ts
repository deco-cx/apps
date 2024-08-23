// deno-lint-ignore-file require-await
import type { ProductListingPage } from "../../../commerce/types.ts";
import { sortOptions, toProductListingPage } from "../../utils/transform.ts";
import { LinxEngage } from "./linxEngage.ts";

export interface Props {
  linxEngage: LinxEngage | null;
}

/**
 * @title Linx Impulse Products - Search
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
): Promise<ProductListingPage | null> => {
  if (req.url.includes("_frsh")) {
    return null;
  }

  const url = new URL(req.url);

  if (!props.linxEngage) {
    return {
      "@type": "ProductListingPage",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      },
      filters: [],
      products: [],
      pageInfo: {
        nextPage: undefined,
        previousPage: undefined,
        currentPage: Number.parseInt(url.searchParams.get("page") || "1"),
        records: 0,
        recordPerPage: 0,
      },
      sortOptions,
    };
  }

  if (props.linxEngage.params?.searchTerm) {
    return toProductListingPage(
      props.linxEngage.response,
      props.linxEngage.params.page,
      props.linxEngage.params.resultsPerPage,
      props.linxEngage.params.url,
      props.linxEngage.params.cdn,
      props.linxEngage.params.pageType,
    );
  } else if (
    props.linxEngage.params.category.length > 0 ||
    props.linxEngage.params.multicategory.length > 0
  ) {
    return toProductListingPage(
      props.linxEngage.response,
      props.linxEngage.params.page,
      props.linxEngage.params.resultsPerPage,
      props.linxEngage.params.url,
      props.linxEngage.params.cdn,
      props.linxEngage.params.pageType,
    );
  } else {
    return {
      "@type": "ProductListingPage",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      },
      filters: [],
      products: [],
      pageInfo: {
        nextPage: undefined,
        previousPage: undefined,
        currentPage: props.linxEngage.params.page,
        records: 0,
        recordPerPage: 0,
      },
      sortOptions,
    };
  }
};

export default loader;
