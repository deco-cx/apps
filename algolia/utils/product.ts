import { SearchIndex } from "npm:algoliasearch@4.20.0";
import { Product, ProductLeaf, PropertyValue } from "../../commerce/types.ts";

export type IndexedProduct = ReturnType<typeof toIndex>;

const unique = (ids: string[]) => [...new Set(ids).keys()];

export const resolveProducts = async (
  products: IndexedProduct[],
  index: SearchIndex,
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
      isVariantOf: p.isVariantOf && {
        ...p.isVariantOf,
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

const normalize = (additionalProperty: PropertyValue[] | undefined = []) =>
  Object.fromEntries(
    additionalProperty
      .filter(Boolean)
      .reduce(
        (acc, current) => {
          const { name, value } = current;

          if (name && value) {
            acc.set(name, acc.get(name) ?? []);
            acc.get(name)!.push(value);
          }

          return acc;
        },
        new Map<string, string[]>(),
      ).entries(),
  );

export const toIndex = (product: Product) =>
  removeType({
    ...product,
    additionalProperty: normalize([
      ...product.additionalProperty ?? [],
      ...product.isVariantOf?.additionalProperty ?? [],
    ]),
    additionalProperty_org: product.additionalProperty,
    brand: product.brand?.name,
    brand_org: product.brand,
    objectID: product.productID,
    isVariantOf: product.isVariantOf && removeType({
      ...product.isVariantOf,
      additionalProperty_org: product.isVariantOf.additionalProperty,
      hasVariant: product.isVariantOf?.hasVariant.map((p) => ({
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
  });

export const fromIndex = (
  product: IndexedProduct,
): Product => ({
  ...product,
  "@type": "Product",
  brand: product.brand_org,
  additionalProperty: product.additionalProperty_org,
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
    hasVariant: [],
    additionalProperty: product.isVariantOf.additionalProperty_org,
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
