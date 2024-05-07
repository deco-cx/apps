import {
  ProductInstallment,
  ProductSearch,
} from "../../vnda/utils/openapi/vnda.openapi.gen.ts";
import { ProductPrice } from "../../vnda/utils/client/types.ts";
import {
  Offer,
  Product,
  PropertyValue,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import { OfferProps, VNDAProduct } from "./types.ts";

interface ProductOptions {
  url: URL;
  /** Price coded currency, e.g.: USD, BRL */
  priceCurrency: string;
  productPrice?: ProductPrice | null;
}

const toPropertyValueTags = (tags: ProductSearch["tags"]): PropertyValue[] =>
  tags?.map((tag) =>
    tag && ({
      "@type": "PropertyValue",
      name: tag.name,
      value: JSON.stringify(tag),
      valueReference: "TAGS",
    } as PropertyValue)
  );

const toURL = (src: string) => src.startsWith("//") ? `https:${src}` : src;

const normalizeInstallments = (
  installments: ProductInstallment[] | number[] = [],
) => {
  if (typeof installments[0] === "number") {
    const total = (installments as number[]).reduce((acc, curr) => acc + curr);

    return [{
      number: installments.length,
      price: installments[0],
      total,
    }];
  }

  return (installments as ProductInstallment[]).map((
    { number, price, total },
  ) => ({
    number,
    price,
    total,
  }));
};

const toOffer = ({
  price,
  sale_price,
  intl_price,
  available_quantity,
  available,
  installments = [],
}: OfferProps): Offer[] => {
  if (!price || !sale_price) {
    return [];
  }

  const priceSpecification: UnitPriceSpecification[] = [{
    "@type": "UnitPriceSpecification",
    priceType: "https://schema.org/SalePrice",
    price: sale_price,
  }];

  if (price > sale_price) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price,
    });
  }

  for (const installment of normalizeInstallments(installments)) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      priceComponentType: "https://schema.org/Installment",
      name: "INSTALLMENT",
      description: "INSTALLMENT",
      billingDuration: installment.number,
      billingIncrement: installment.price,
      price: installment.total,
    });
  }

  const offers: Offer[] = [{
    "@type": "Offer" as const,
    seller: "VNDA",
    price,
    priceSpecification,
    inventoryLevel: {
      value: available_quantity,
    },
    availability: available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  }];

  if (intl_price) {
    offers.push({
      "@type": "Offer",
      seller: "VNDA_INTL",
      price: intl_price,
      priceSpecification: [{
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: intl_price,
      }],
      inventoryLevel: {
        value: available_quantity,
      },
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      // Static since VNDA only have a BRL price and USD when intl_price is available
      priceCurrency: "USD",
    });
  }

  return offers;
};

export const toProduct = (
  product: VNDAProduct,
  options: ProductOptions,
): Product => {
  const { url, priceCurrency, productPrice } = options;
  const { price = 0, sale_price = 0, available = false, instalments = [] } =
    product;
  const offers = toOffer({
    price,
    sale_price,
    available_quantity: 1,
    available,
    installments: instalments,
  });

  const variantUrl = new URL(
    product.url,
    url.origin,
  ).href;

  const productUrl = new URL(
    product.url,
    url.origin,
  ).href;

  const productID = `${product.reference}`;
  const productGroupID = `${product.objectID}`;

  const myTags = "tags" in product ? product.tags : [];

  return {
    "@type": "Product",
    productID,
    sku: productID,
    url: variantUrl,
    name: product.name,
    description: product.description,
    additionalProperty: [
      ...toPropertyValueTags(myTags),
    ],
    inProductGroupWithID: productGroupID,
    gtin: product.reference,
    isVariantOf: {
      "@type": "ProductGroup",
      productGroupID,
      url: productUrl,
      name: product.name,
      model: product.reference,
      additionalProperty: [],
      hasVariant: [],
    },
    image: product.images?.length ?? 0 > 1
      ? product.images?.map((img) => ({
        "@type": "ImageObject" as const,
        encodingFormat: "image",
        alternateName: `${img.url}`,
        url: toURL(img.url!),
      }))
      : [
        {
          "@type": "ImageObject",
          encodingFormat: "image",
          alternateName: product.name ?? "",
          url: toURL(product.image_url ?? ""),
        },
      ],
    // images:
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: priceCurrency,
      highPrice: productPrice?.price ?? product.price!,
      lowPrice: productPrice?.sale_price ?? product.sale_price!,
      offerCount: offers.length,
      offers: offers,
    },
  };
};

export const getPageInfo = (
  page: number,
  nbPages: number,
  nbHits: number,
  hitsPerPage: number,
  url: URL,
  startingPage: number,
) => {
  const next = page + 1;
  const prev = page - 1;
  const hasNextPage = next < nbPages;
  const hasPreviousPage = prev >= 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", `${next + startingPage}`);
  }

  if (hasPreviousPage) {
    previousPage.set("page", `${prev + startingPage}`);
  }

  return {
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
    records: nbHits,
    recordPerPage: hitsPerPage,
    currentPage: page + startingPage,
  };
};
