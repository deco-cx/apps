import type {
  Offer,
  Product,
  PropertyValue,
  UnitPriceSpecification,
} from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  aggregateOffers,
  toAdditionalPropertyCategory,
  toAdditionalPropertyCluster,
  toAdditionalPropertyReferenceId,
  toAdditionalPropertySpecification,
} from "../../utils/transform.ts";

export type Props = {
  productID: string;
};

/**
 * @title VTEX Integration - Product Loader
 * @description DO NOT USE this on the storefront
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product | null> => {
  const { vcs } = ctx;
  const sc = 1;

  const sku = await vcs
    ["GET /api/catalog_system/pvt/sku/stockkeepingunitbyid/:skuId"]({
      skuId: props.productID,
    }).then((res) => res.json());

  if (!sku.IsActive) return null;

  const [skus, salesChannels, ...simulations] = await Promise.all([
    vcs
      ["GET /api/catalog_system/pvt/sku/stockkeepingunitByProductId/:productId"](
        {
          productId: sku.ProductId,
        },
      ).then((res) => res.json()),
    vcs["GET /api/catalog_system/pvt/saleschannel/list"]({})
      .then((res) => res.json()),
    ...sku.SkuSellers.map(({ SellerId }) =>
      vcs["POST /api/checkout/pub/orderForms/simulation"]({
        RnbBehavior: 1,
        sc,
      }, {
        body: { items: [{ id: `${sku.Id}`, seller: SellerId, quantity: 1 }] },
      }).then((res) => res.json())
    ),
  ]);

  const channel = salesChannels.find((c) => c.Id === sc);

  const productGroupID = `${sku.ProductId}`;
  const productID = `${sku.Id}`;

  const additionalProperty = [
    sku.AlternateIds.RefId
      ? toAdditionalPropertyReferenceId({
        name: "RefId",
        value: sku.AlternateIds.RefId,
      })
      : null,
    ...Object.entries(sku.ProductCategories ?? {}).map(([propertyID, value]) =>
      toAdditionalPropertyCategory({ propertyID, value })
    ),
    ...Object.entries(sku.ProductClusterNames ?? {}).map((
      [propertyID, value],
    ) => toAdditionalPropertyCluster({ propertyID, value })),
    ...sku.SkuSpecifications.flatMap((spec) =>
      spec.FieldValues.map((value, it) =>
        toAdditionalPropertySpecification({
          propertyID: spec.FieldValueIds[it]?.toString(),
          name: spec.FieldName,
          value,
        })
      )
    ),
    ...sku.SalesChannels.map((channel): PropertyValue => ({
      "@type": "PropertyValue",
      name: "salesChannel",
      propertyID: channel.toString(),
    })),
  ].filter((p): p is PropertyValue => Boolean(p));

  const groupAdditionalProperty = sku.ProductSpecifications.flatMap((spec) =>
    spec.FieldValues.map((value, it) =>
      toAdditionalPropertySpecification({
        propertyID: spec.FieldValueIds[it]?.toString(),
        name: spec.FieldName,
        value,
      })
    )
  );

  const offers = simulations.flatMap(({ items, paymentData }) =>
    items?.map((item): Offer | null => {
      const {
        sellingPrice,
        listPrice,
        price,
        seller,
        priceValidUntil,
        availability,
      } = item;
      const spotPrice = sellingPrice || price;

      if (!spotPrice || !listPrice) return null;

      return {
        "@type": "Offer",
        price: spotPrice / 100,
        seller: seller,
        priceValidUntil: priceValidUntil,
        inventoryLevel: {}, // TODO: Could not find this info anywhere
        availability: availability === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        priceSpecification: [
          {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/ListPrice",
            price: listPrice / 100,
          },
          {
            "@type": "UnitPriceSpecification",
            priceType: "https://schema.org/SalePrice",
            price: spotPrice / 100,
          },
          ...paymentData?.installmentOptions?.flatMap((
            option,
          ): UnitPriceSpecification =>
            option.installments.map((
              i: { count: number; value: number; total: number },
            ) => ({
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/SalePrice",
              priceComponentType: "https://schema.org/Installment",
              name: option.paymentName,
              billingDuration: i.count,
              billingIncrement: i.value / 100,
              price: i.total / 100,
            }))
          ) ?? [],
        ],
      };
    })
  ).filter((o): o is Offer => Boolean(o));

  return {
    "@type": "Product",
    productID,
    sku: productID,
    inProductGroupWithID: productGroupID,
    category: Object.values(sku.ProductCategories ?? {}).join(" > "),
    url: `${sku.DetailUrl}?skuId=${productID}`,
    name: sku.SkuName,
    gtin: sku.AlternateIds.Ean,
    image: sku.Images.map((img) => ({
      "@type": "ImageObject",
      encodingFormat: "image",
      alternateName: img.ImageName ?? img.FileId,
      url: img.ImageUrl,
    })),
    isVariantOf: {
      "@type": "ProductGroup",
      url: sku.DetailUrl,
      hasVariant: skus
        ?.filter((x) => x.IsActive)
        .map(({ Id }) => ({
          "@type": "Product",
          productID: `${Id}`,
          sku: `${Id}`,
        })) ?? [],
      additionalProperty: groupAdditionalProperty,
      productGroupID,
      name: sku.ProductName,
      description: sku.ProductDescription,
    },
    additionalProperty,
    releaseDate: sku.ReleaseDate &&
      new Date(sku.ReleaseDate).toISOString(),
    brand: {
      "@type": "Brand",
      "@id": sku.BrandId,
      name: sku.BrandName,
    },
    offers: aggregateOffers(offers, channel?.CurrencyCode),
  };
};

export default loader;
