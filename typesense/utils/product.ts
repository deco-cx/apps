import Typesense from "npm:typesense@1.7.1";
import { SearchOnlyCollection } from "npm:typesense@1.7.1/lib/Typesense/SearchOnlyCollection";
import { Product, ProductLeaf, PropertyValue } from "../../commerce/types.ts";
import { replaceHighlight } from "./highlight.ts";
import { once } from "./once.ts";

type PromiseOf<T> = T extends Promise<infer K> ? K : never;

export type ProductsCollectionName = "products";
export type IndexedProduct = ReturnType<typeof toIndex>;
export type ProductsCollection = PromiseOf<
  ReturnType<ReturnType<typeof setupProductsCollection>>
>;

const unique = (ids: string[]) => [...new Set(ids).keys()];

export const resolveProducts = async (
  products: IndexedProduct[],
  clients: ProductsCollection,
  url: string | URL,
): Promise<Product[]> => {
  const hasVariantIds = products.flatMap((p) =>
    p.isVariantOf?.hasVariant?.map((x) => x.productID)
  );
  const isSimilarToIds = products.flatMap((p) =>
    p.isSimilarTo?.map((x) => x.productID)
  );

  const ids = [
    ...hasVariantIds,
    ...isSimilarToIds,
  ].filter((x): x is string => typeof x === "string");

  const { hits: similars = [] } = await clients.search.documents().search({
    q: "*",
    query_by: "",
    filter_by: `id:[${unique(ids).join(",")}]`,
  }, {});

  const productsById = new Map<string, Product>();
  for (const { document: product } of similars) {
    product && productsById.set(product.productID, fromIndex(product));
  }

  return products
    .map(fromIndex)
    .map((p) => ({
      ...p,
      url: p.url && new URL(p.url, url).href,
      isVariantOf: p.isVariantOf && {
        ...p.isVariantOf,
        url: p.isVariantOf.url && new URL(p.isVariantOf.url, url).href,
        hasVariant: p.isVariantOf?.hasVariant
          ?.map((p) => productsById.get(p.productID))
          .filter((p): p is ProductLeaf => Boolean(p)) ?? [],
      },
      isSimilarTo: p.isSimilarTo
        ?.map((p) => productsById.get(p.productID))
        .filter((p): p is ProductLeaf => Boolean(p)),
    }));
};

const removeType = <T>(object: T & { "@type": string }): T => ({
  ...object,
  "@type": undefined,
});

const normalize = (additionalProperty: PropertyValue[] | undefined = []) => {
  const map = new Map<string, string[]>();

  for (const property of additionalProperty) {
    const { name, value } = property ?? {};

    if (!name || !value) continue;

    map.set(name, map.get(name) ?? []).get(name)!.push(value);
  }

  return Object.fromEntries(map.entries());
};

export const toIndex = ({ isVariantOf, ...product }: Product) => {
  const facets = [
    ...product.additionalProperty ?? [],
    {
      "@type": "PropertyValue" as const,
      name: "brand",
      value: product.brand?.name,
    },
  ];
  const facetKeys = new Set(facets.map((f) => f.name));
  const groupFacets = [
    ...isVariantOf?.additionalProperty ?? [],
    {
      "@type": "PropertyValue" as const,
      name: "model",
      value: isVariantOf?.model,
    },
  ].filter((f) => !facetKeys.has(f.name));

  return removeType({
    ...product,
    isVariantOf: isVariantOf && removeType({
      ...isVariantOf,
      hasVariant: isVariantOf?.hasVariant.map((p) => ({
        productID: p.productID,
      })),
    }),
    isSimilarTo: product.isSimilarTo?.map((p) => ({
      productID: p.productID,
    })),
    offers: product.offers && removeType({
      ...product.offers,
      offers: product.offers.offers.map((offer) => ({
        ...removeType(offer),
        priceSpecification: offer.priceSpecification.map(removeType),
      })),
    }),
    image: product.image?.map(removeType),
    id: product.productID,
    groupFacets: normalize(groupFacets),
    facets: normalize(facets),
  });
};

export const fromIndex = ({
  id: _id,
  facets: _facets,
  groupFacets: _groupFacets,
  ...product
}: IndexedProduct): Product => ({
  ...product,
  "@type": "Product",
  offers: product.offers && {
    ...product.offers,
    "@type": "AggregateOffer",
    offers: product.offers.offers.map((offer) => ({
      ...offer,
      priceSpecification: offer.priceSpecification.map((spec) => ({
        ...spec,
        "@type": "UnitPriceSpecification",
      })),
      "@type": "Offer",
    })),
  },
  isVariantOf: product.isVariantOf && {
    ...product.isVariantOf,
    hasVariant: product.isVariantOf.hasVariant.map((p) => ({
      "@type": "Product",
      productID: p.productID,
      sku: p.productID,
    })),
    "@type": "ProductGroup",
  },
  image: product.image?.map((img) => ({
    ...img,
    "@type": "ImageObject",
  })),
  isSimilarTo: product.isSimilarTo && product.isSimilarTo.map((similar) => ({
    ...similar,
    "@type": "Product",
    sku: similar.productID,
  })),
});

export const setupProductsCollection = (
  adminClient: Typesense.Client,
  searchClient: Typesense.SearchClient,
) =>
  once(async () => {
    const name: ProductsCollectionName = "products";
    const admin = adminClient.collections<IndexedProduct>(name);
    const search = searchClient.collections<IndexedProduct>(name);

    const exists = await admin.exists();

    if (!exists) {
      await adminClient.collections().create({
        name,
        enable_nested_fields: true,
        default_sorting_field: "offers.lowPrice",
        fields: ([
          {
            name: "inProductGroupWithID",
            type: "string",
            facet: true,
            optional: false,
          },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "string", facet: true },
          { name: "brand.name", type: "string", facet: true },
          { name: "facets.*", type: "auto", facet: true },
          { name: "groupFacets.*", type: "auto", facet: true },
          { name: "isVariantOf.name", type: "string", sort: true },
          { name: "isVariantOf.model", type: "string" },
          { name: "isVariantOf.description", type: "string" },
          { name: "offers.offers.availability", type: "string[]" },
          {
            name: "offers.highPrice",
            type: "float",
            sort: true,
            optional: false,
          },
          {
            name: "offers.lowPrice",
            type: "float",
            sort: true,
            optional: false,
          },
        ] as const).map((x) => ({ index: true, optional: true, ...x })),
      });
    }

    return { admin, search: search as SearchOnlyCollection<IndexedProduct> };
  });

export type Sort =
  | "isVariantOf.name:asc"
  | "isVariantOf.name:desc"
  | "offers.lowPrice:asc"
  | "offers.lowPrice:desc";

export const search = async (
  { q, per_page, filter_by, highlight, page, sort_by }: {
    q: string;
    page?: number;
    per_page?: number;
    filter_by?: string;
    highlight?: boolean;
    sort_by?: Sort;
  },
  clients: ProductsCollection,
  url: string | URL,
) => {
  const response = await clients.search.documents().search({
    q,
    page,
    sort_by,
    per_page,
    filter_by,
    group_limit: 1,
    highlight_affix_num_tokens: 1,
    snippet_threshold: 0,
    group_by: "inProductGroupWithID",
    query_by: [
      "name",
      "description",
      "category",
      "isVariantOf.name",
      "isVariantOf.description",
      "isVariantOf.model",
    ],
    highlight_fields: [
      "name",
      "description",
      "isVariantOf.name",
      "isVariantOf.description",
      "isVariantOf.model",
    ],
    facet_by: [
      "facets.*",
      "groupFacets.*",
    ],
    search_cutoff_ms: 100,
  }, {});

  const products = response.grouped_hits
    ?.flatMap(({ hits }) => hits[0])
    .map((p) => replaceHighlight(p.document, highlight ? p.highlight : {}));

  return {
    ...response,
    products: products ? await resolveProducts(products, clients, url) : null,
  };
};
