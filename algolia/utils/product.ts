import { createFetchRequester } from "npm:@algolia/requester-fetch@4.20.0";
import algolia, { SearchClient } from "npm:algoliasearch@4.20.0";
import { Product, ProductLeaf, PropertyValue } from "../../commerce/types.ts";
import { State } from "../mod.ts";

export type IndexedProduct = ReturnType<typeof toIndex>;
export type Indices =
  | "products"
  | "products_price_desc"
  | "products_price_asc"
  | "products_query_suggestions";

const unique = (ids: string[]) => [...new Set(ids).keys()];

const indexName: Indices = "products";

export const resolveProducts = async (
  products: IndexedProduct[],
  client: SearchClient,
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

  const { results: similars } = await client.multipleGetObjects<
    IndexedProduct
  >(unique(ids).map((objectID) => ({ objectID, indexName })));

  const productsById = new Map<string, Product>();
  for (const product of similars) {
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

// TODO: add ManufacturerCode
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
    objectID: product.productID,
    groupFacets: normalize(groupFacets),
    facets: normalize(facets),
  });
};

export const fromIndex = (
  { facets: _f, groupFacets: _fg, objectID: _oid, ...product }: IndexedProduct,
): Product => ({
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

export const setupProductsIndices = async (
  { applicationId, adminApiKey }: State,
) => {
  const client = algolia.default(applicationId, adminApiKey, {
    requester: createFetchRequester(), // Fetch makes it perform mutch better
  });

  await client.initIndex("products" satisfies Indices).setSettings({
    distinct: true,
    attributeForDistinct: "inProductGroupWithID",
    searchableAttributes: [
      "name",
      "gtin",
      "brand.name",
      "description",
      "isVariantOf.name",
      "isVariantOf.model",
      "isVariantOf.description",
      "offers.offers.availability",
      "offers.offers.priceSpecification.priceType",
      "offers.offers.priceSpecification.priceComponentType",
    ],
    attributesForFaceting: [
      "facets",
      "groupFacets",
    ],
    numericAttributesForFiltering: [
      "offers.highPrice",
      "offers.lowPrice",
      "offers.offers.price",
      "offers.offers.priceSpecification.price",
    ],
    replicas: [
      "virtual(products_price_desc)",
      "virtual(products_price_asc)",
    ],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
  });

  await client.initIndex("products_price_desc" satisfies Indices).setSettings({
    customRanking: [
      "desc(offers.lowPrice)",
    ],
  });

  await client.initIndex("products_price_asc" satisfies Indices).setSettings({
    customRanking: [
      "asc(offers.lowPrice)",
    ],
  });

  /**
   * Create query suggestions index with defaults.
   *
   * TODO: Use algolia client API once they provide their clients via npm
   */
  const options = {
    indexName: "products_query_suggestions",
    sourceIndices: [{
      indexName: "products",
      minHits: 3,
      minLetters: 3,
      facets: [
        {
          "attribute": "facets.category",
          "amount": 1,
        },
        {
          "attribute": "facets.brand",
          "amount": 1,
        },
      ],
    }],
  };

  // Update index
  const response = await fetch(
    `https://query-suggestions.us.algolia.com/1/configs/${options.indexName}`,
    {
      method: "PUT",
      headers: {
        "X-Algolia-Application-Id": applicationId,
        "X-Algolia-API-Key": adminApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    },
  );

  // Index update was NOT successfull, maybe create a new one?
  if (response.status !== 200) {
    await fetch(
      "https://query-suggestions.us.algolia.com/1/configs",
      {
        method: "POST",
        headers: {
          "X-Algolia-Application-Id": applicationId,
          "X-Algolia-API-Key": adminApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      },
    );
  }

  await client.initIndex("products_query_suggestions" satisfies Indices)
    .setSettings({
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    });

  return client;
};
