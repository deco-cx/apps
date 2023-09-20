import { SearchIndex } from "npm:algoliasearch@4.20.0";
import { Product, ProductLeaf, PropertyValue } from "../../commerce/types.ts";
import algolia from "npm:algoliasearch@4.20.0";
import { createFetchRequester } from "npm:@algolia/requester-fetch@4.20.0";
import { State } from "../mod.ts";

export type IndexedProduct = ReturnType<typeof toIndex>;
export type Indices = "products" | "products_price_desc" | "products_price_asc";

const unique = (ids: string[]) => [...new Set(ids).keys()];

export const resolveProducts = async (
  products: IndexedProduct[],
  index: SearchIndex,
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

  const [{ results: similars }] = await Promise.all([
    index.getObjects<IndexedProduct>(unique(ids)),
  ]);

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

  return client;
};
