import type { Filter, ProductListingPage } from "../../commerce/types.ts";
import { slugify } from "../../vtex/utils/slugify.ts";
import type { AppContext } from "../mod.ts";
import type { LogicommerceProductSorts } from "../types.ts";
import type { ProductCollectionDTO } from "../utils/openapi/api.openapi.gen.ts";
import { toProduct } from "../utils/transform.ts";

/** @title {{{name}}} - {{{value}}} */
interface FilterParam {
  name: string;
  value: string;
}

interface Props {
  /**
   * @title Query
   * @description overrides the query term
   */
  q?: string;
  sort?: LogicommerceProductSorts;
  /** @description (DON'T USE FILTERS WITH SAME NAME, like filterOption[size]=01, filterOption[size]=02), use any param from "https://devcenter.logicommerce.com/apiCore/359#operation/getProducts" */
  filters?: FilterParam[];
  /**
   * @title Page query parameter
   */
  page?: number;
  /** @description Overrides the ?q= */
  customQueryParam?: string;
  /** @description Overrides the ?sort= */
  customSortParam?: string;
  /** @description Ignore if pathname has a language prefix like, (0) /en/department... -> (1) /department... */
  pathnameOffset?: number;
}

const sortOptions: { label: string; value: LogicommerceProductSorts }[] = [
  { label: "id:asc", value: "id.asc" },
  { label: "id:desc", value: "id.desc" },
  { label: "pId:asc", value: "pId.asc" },
  { label: "pId:desc", value: "pId.desc" },
  { label: "sku:asc", value: "sku.asc" },
  { label: "sku:desc", value: "sku.desc" },
  { label: "name:asc", value: "name.asc" },
  { label: "name:desc", value: "name.desc" },
  { label: "priority:asc", value: "priority.asc" },
  { label: "priority:desc", value: "priority.desc" },
  { label: "price:asc", value: "price.asc" },
  { label: "price:desc", value: "price.desc" },
  { label: "offer:asc", value: "offer.asc" },
  { label: "offer:desc", value: "offer.desc" },
  { label: "featured:asc", value: "featured.asc" },
  { label: "featured:desc", value: "featured.desc" },
  { label: "publicationDate:asc", value: "publicationDate.asc" },
  { label: "publicationDate:desc", value: "publicationDate.desc" },
];

const emptyResponse: ProductListingPage = {
  "@type": "ProductListingPage",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [],
    numberOfItems: 0,
  },
  pageInfo: {
    records: 0,
    recordPerPage: 0,
    currentPage: 1,
    nextPage: undefined,
    previousPage: undefined,
  },
  products: [],
  filters: [],
  sortOptions: [],
};

/**
 * @title PLP - Logicommerce Integration
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);

  const search = url.searchParams.get(props.customQueryParam ?? "q");

  props.q = props.q ?? search ?? undefined;

  const oldSort = props.sort;
  props.sort = url.searchParams.get(
    props.customSortParam ?? "sort",
  ) as LogicommerceProductSorts;
  props.sort ??= oldSort ?? "id.asc";

  const categories = url.pathname.split("/").slice(
    1 + (props.pathnameOffset ?? 0),
  );

  let products: ProductCollectionDTO = {
    items: [],
    pagination: {
      page: 0,
      totalItems: 0,
      perPage: 0,
    },
  };

  let categoryId: number | undefined = undefined;

  if (categories.length && !search) {
    const r = await ctx.api["GET /categories/tree"](
      { q: categories[0] },
      {
        headers: req.headers,
      },
    ).then((res) => res.json());

    if (r.items?.length === 0) {
      return emptyResponse;
    }

    let cat = r.items?.[0];
    let n = 1;

    while (true) {
      if (n === categories.length) {
        if (slugify(cat?.pId ?? "") === slugify(categories.at(-1) ?? "")) {
          categoryId = cat?.id;
        }

        break;
      }

      cat = cat?.subcategories?.find((c) =>
        slugify(c.pId ?? "") === slugify(categories[n])
      );

      if (!cat) break;
      n += 1;
    }

    if (categoryId === undefined) {
      return emptyResponse;
    }
  }

  // You can't use filters with same type, like, filterOption[size]=01 and filterOption[size]=02
  // It will become filterOption[size]=02
  // It occurs because `createHttpClient` accepts only object as params
  // And you can't have two keys with the same name in an object
  const customFilters = Object.fromEntries(
    props.filters?.map(({ name, value }) => [name, value]) ?? [],
  );

  const filtersFromUrl = Object.fromEntries(
    [...url.searchParams.entries()].filter(([key]) => key.startsWith("filter")),
  );

  props.page ??= Number(url.searchParams.get("page"));

  products = await ctx.api["GET /products"](
    { ...props, categoryId, ...filtersFromUrl, ...customFilters },
    { headers: req.headers },
  ).then((res) => res.json());

  const nextPage = new URL(req.url);
  const previousPage = new URL(req.url);
  const currentPage = products.pagination?.page ?? 0;
  const pagesCount = products.pagination?.totalPages ?? 0;

  nextPage.searchParams.set(
    "page",
    (products.pagination?.page ?? 0 + 1).toString(),
  );
  previousPage.searchParams.set(
    "page",
    (products.pagination?.page ?? 0 - 1).toString(),
  );

  const filters: Filter[] = [];

  const minPrice = products.filter?.prices?.min ?? 0;
  const maxPrice = products.filter?.prices?.max ?? 0;

  if (minPrice !== maxPrice) {
    filters.push({
      "@type": "FilterRange",
      key: "price",
      label: "Price",
      values: {
        min: minPrice,
        max: maxPrice,
      },
    });
  }

  // OPTIONS FILTERS
  for (const filter of products.filter?.options ?? []) {
    filters.push({
      "@type": "FilterToggle",
      key: filter.filterName ?? "",
      label: filter.name ?? "",
      quantity: 0,
      values: (filter.values ?? []).map((value) => {
        const url = new URL(req.url);

        const k = `filterOption[${filter.filterName}]`;
        const v = value.value ?? "";

        const selected = url.searchParams.getAll(k).includes(v);

        if (selected) {
          url.searchParams.delete(k, v);
        } else {
          url.searchParams.append(k, v);
        }

        return {
          label: v,
          quantity: 0,
          value: v,
          url: url.toString(),
          selected,
        };
      }),
    });
  }

  // TAGS/LABELS FILTERS
  for (const filter of products.filter?.customTags ?? []) {
    filters.push({
      "@type": "FilterToggle",
      key: filter.name ?? "",
      label: filter.name ?? "",
      quantity: 0,
      values: (filter.filterValues ?? []).map((v) => {
        const url = new URL(req.url);

        const k = `filterCustomTag[${filter.id}]`;

        const selected = url.searchParams.getAll(k).includes(v);

        if (selected) {
          url.searchParams.delete(k, v);
        } else {
          url.searchParams.append(k, v);
        }

        return {
          label: v,
          quantity: 0,
          value: v,
          url: url.toString(),
          selected,
        };
      }),
    });
  }

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: categories.map((c, i) => ({
        "@type": "ListItem",
        position: i,
        name: c,
        item: `/${categories.slice(0, i + 1).join("/")}`,
      })),
      numberOfItems: categories.length,
    },
    pageInfo: {
      records: products.pagination?.totalItems ?? 0,
      recordPerPage: products.pagination?.perPage ?? 0,
      currentPage,
      nextPage: currentPage + 1 < pagesCount ? nextPage.toString() : undefined,
      previousPage: currentPage - 1 > 0 ? previousPage.toString() : undefined,
    },
    products: products.items?.map((p) => toProduct(p)) ?? [],
    filters,
    sortOptions,
  };
};

export default loader;
