import type {
  OptionDTO,
  ProductDTO,
} from "../utils/openapi/api.openapi.gen.ts";
import type {
  ImageObject,
  ItemAvailability,
  Product,
  ProductLeaf,
  PropertyValue,
} from "../../commerce/types.ts";

const productAvailability = {
  AVAILABLE: "https://schema.org/InStock",
  RESERVE: "https://schema.org/PreOrder",
  UNAVAILABLE: "https://schema.org/OutOfStock",
} as Record<string, ItemAvailability>;

function optionToHasVariant(p: ProductDTO, o: OptionDTO): ProductLeaf[] {
  const values = o.values ?? [];
  const stock = p.combinations
    ?.find((c) =>
      c.values?.find((v) =>
        o.values?.map((v) => v.id)?.includes(v.productOptionValueId)
      )
    )
    ?.stocks?.sort((a, b) => (b.units ?? 0) - (a.units ?? 0))[0];

  const combinationDataOption = p.combinationData?.options?.find(({ id }) =>
    id === o.id
  );
  const combinationDataOptionValues = (combinationDataOption?.values ?? [])
    .reduce(
      (acc, v) => {
        if (v.id) {
          acc[v.id] = {
            selected: v.selected ?? false,
            available: v.available ?? false,
          };
        }

        return acc;
      },
      {} as Record<number, { selected: boolean; available: boolean }>,
    );

  return values.map((value) => {
    const image = value.images?.largeImage ?? value.images?.mediumImage ??
      value.images?.smallImage;

    const additionalProperty: PropertyValue[] = [];

    additionalProperty.push({
      "@type": "PropertyValue",
      name: o.language?.filterName,
      value: value.language?.value,
    });

    additionalProperty.push({
      "@type": "PropertyValue",
      name: "optionType",
      value: o.type,
    });

    // Origin will not be used
    const url = new URL(
      p.language?.urlSeo ?? "",
      "https://www.logicommerce.com.br",
    );
    url.searchParams.set("skuId", value.id?.toString() ?? "");

    return {
      "@type": "Product",
      productID: value.id?.toString() ?? "",
      sku: value.id?.toString() ?? "",
      name: o.language?.name,
      description: value.language?.longDescription ??
        value.language?.shortDescription,
      image: image ? [{ "@type": "ImageObject", url: image }] : [],
      additionalProperty,
      url: url.href.replace(url.origin, ""),
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "BRL",
        highPrice: value.prices?.prices?.retailPrice ?? 0,
        lowPrice: value.prices?.prices?.basePrice ?? 0,
        offerCount: 1,
        offers: [
          {
            "@type": "Offer",
            price: value.prices?.prices?.basePrice ?? 0,
            priceCurrency: "BRL",
            availability: combinationDataOptionValues[value.id ?? 0]?.available
              ? productAvailability.AVAILABLE
              : productAvailability.UNAVAILABLE,
            inventoryLevel: { value: stock?.units ?? 0 },
            priceSpecification: [],
          },
        ],
      },
    };
  });
}

export const toProduct = (p: ProductDTO, skuId?: string): Product => {
  const image = p.mainImages?.largeImage ?? p.mainImages?.mediumImage ??
    p.mainImages?.smallImage;
  const images = (p.additionalImages ?? []).map(
    ({ smallImage, largeImage }) =>
      ({
        "@type": "ImageObject",
        url: largeImage ?? smallImage,
      }) as ImageObject,
  );

  if (image) {
    images.push({ "@type": "ImageObject", url: image });
  }

  const additionalProperty: PropertyValue[] = [];

  if (p.mainImages?.smallImage) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "smallImage",
      value: p.mainImages?.smallImage,
    });
  }

  if (p.mainImages?.mediumImage) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "mediumImage",
      value: p.mainImages?.mediumImage,
    });
  }

  if (p.mainImages?.largeImage) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "largeImage",
      value: p.mainImages?.largeImage,
    });
  }

  // Origin will not be used
  const url = new URL(
    p.language?.urlSeo ?? "",
    "https://www.logicommerce.com.br",
  );
  url.searchParams.set("skuId", skuId ?? "");

  return {
    "@type": "Product",
    productID: p.id?.toString() ?? "",
    sku: p.codes?.sku ?? "",
    name: p.language?.name,
    description: p.language?.longDescription ?? p.language?.shortDescription,
    url: url.href.replace(url.origin, ""),
    additionalProperty,
    isVariantOf: {
      "@type": "ProductGroup",
      additionalProperty,
      description: p.language?.longDescription ?? p.language?.shortDescription,
      name: p.language?.name,
      image: images,
      url: p.language?.urlSeo,
      hasVariant: p.options?.flatMap((o) => optionToHasVariant(p, o)) ?? [],
      productGroupID: p.id?.toString() ?? "",
    },
    image: images,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      highPrice: p.prices?.prices?.retailPrice ?? 0,
      lowPrice: p.prices?.prices?.basePrice ?? 0,
      offerCount: 1,
      offers: [
        {
          "@type": "Offer",
          price: p.prices?.prices?.basePrice ?? 0,
          priceCurrency: "BRL",
          availability: productAvailability[
            p.combinationData?.status ?? productAvailability.UNAVAILABLE
          ],
          inventoryLevel: { value: p.combinationData?.stock?.units ?? 0 },
          priceSpecification: [],
        },
      ],
    },
  };
};
