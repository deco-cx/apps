import type { ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { isGridProductsModel } from "../../utils/paths.ts";
import {
  toBreadcrumbList,
  toFilters,
  toProduct,
} from "../../utils/transform.ts";

const getPageInfo = ({ page, nbPages, recordPerPage, records, url }: {
  page: number;
  nbPages: number;
  records: number;
  recordPerPage: number;
  url: URL;
}) => {
  const next = page + 1;
  const prev = page - 1;
  const hasNextPage = next < nbPages;
  const hasPreviousPage = prev >= 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("pg", `${next}`);
  }

  if (hasPreviousPage) {
    previousPage.set("pg", `${prev}`);
  }

  return {
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
    currentPage: page,
    records,
    recordPerPage,
  };
};

/**
 * @title Linx Integration
 * @description Product Listing Page loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const { cdn } = ctx;

  const page = Number(url.searchParams.get("pg")) ?? 0;

  const [
    forFacets,
    forProducts,
  ] = await Promise.all([
    ctx.invoke("linx/loaders/path.ts", { f: "", fc: "true" }),
    ctx.invoke("linx/loaders/path.ts"),
  ]);

  if (
    !forFacets || !forProducts ||
    !isGridProductsModel(forProducts) || !isGridProductsModel(forFacets)
  ) {
    throw new Error("Expected GridProducts model");
  }

  const {
    PageInfo: pageInfo,
    Model: {
      Navigation,
      Grid: {
        SortOptions = [],
        Products = [],
        ProductCount,
        PageSize,
        PageCount,
      },
    },
  } = forProducts;
  const { Model: { Grid: { Facets } } } = forFacets;

  const products = Products.map((product) =>
    toProduct(product, product.ProductSelection?.SkuID, {
      cdn,
      currency: "BRL",
      url,
    })
  );

  return {
    "@type": "ProductListingPage",
    breadcrumb: toBreadcrumbList(Navigation, url),
    filters: toFilters(Facets, url),
    products,
    pageInfo: getPageInfo({
      page,
      nbPages: PageCount,
      records: ProductCount,
      recordPerPage: PageSize,
      url,
    }),
    sortOptions: SortOptions.map((sort) => ({
      value: sort.Alias,
      label: sort.Label,
    })),
    seo: {
      title: pageInfo.PageTitle,
      description: pageInfo.MetaDescription || "",
      canonical: pageInfo.CanonicalLink,
    },
  };
};

export default loader;
