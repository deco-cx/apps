import { Product, ProductLeaf } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { batch } from "../batch.ts";
import { OpenAPI } from "../openapi/vcs.openapi.gen.ts";
import { getSegmentFromBag, isAnonymous } from "../segment.ts";
import {
  aggregateOffers,
  SCHEMA_LIST_PRICE,
  SCHEMA_SALE_PRICE,
} from "../transform.ts";

type Item = NonNullable<
  OpenAPI["POST /api/checkout/pub/orderForms/simulation"]["response"]["items"]
>[number];

const doSimulate = (items: {
  id: string;
  quantity: number;
  seller: string | undefined;
}[], ctx: AppContext) => {
  const {
    payload: {
      priceTables,
      utm_campaign,
      utm_source,
      utmi_campaign,
      campaigns,
      channel,
      regionId,
    },
  } = getSegmentFromBag(ctx);

  const md = new Map<string, unknown>();
  utm_campaign && md.set("utmCampaign", utm_campaign);
  utm_source && md.set("utmSource", utm_source);
  utmi_campaign && md.set("utmiCampaign", utmi_campaign);
  campaigns && md.set("campaigns", [{ id: campaigns }]);
  const marketingData = md.size > 0
    ? Object.fromEntries(md.entries())
    : undefined;

  const body = {
    items,
    marketingData,
    priceTables: priceTables?.split(","),
    shippingData: {
      logisticsInfo: regionId && [{ regionId }],
    },
  };

  const params = { sc: Number(channel) || undefined, RnbBehavior: 1 };

  return ctx.vcs["POST /api/checkout/pub/orderForms/simulation"](params, {
    body,
  })
    .then((res) => res.json());
};

export const extension = async (products: Product[], ctx: AppContext) => {
  if (isAnonymous(ctx)) {
    return products;
  }

  const items =
    products?.flatMap((p) =>
      p.isVariantOf?.hasVariant.flatMap((v) =>
        v.offers?.offers.map((o) => ({
          id: v.productID,
          quantity: 1,
          seller: o.seller,
        })) ?? []
      ) ?? []
    ) ?? [];

  // VTEX API limits to 300 simulations
  const batched = batch(items, 300);

  const responses = await Promise.all(
    batched.map((batch) => doSimulate(batch, ctx)),
  );

  const mapped = new Map<string, Map<string, Item>>();

  for (const response of responses) {
    for (const item of response.items ?? []) {
      if (!item?.id || !item.seller) {
        continue;
      }

      if (!mapped.has(item.id)) {
        mapped.set(item.id, new Map<string, Item>());
      }

      mapped.get(item.id)!.set(item.seller, item);
    }
  }

  const fixOffer = (product: ProductLeaf): void => {
    if (!product.offers) return;

    const skuOffers = mapped.get(product.productID);
    if (!skuOffers) return;

    let changed = false;
    for (const o of product.offers.offers) {
      const simulated = skuOffers.get(o.seller!);
      if (!simulated) continue;

      const salePrice = simulated.price != null
        ? simulated.price / 100
        : o.price;
      const listPrice = simulated.listPrice != null
        ? simulated.listPrice / 100
        : undefined;
      o.price = salePrice;
      changed = true;

      for (const spec of o.priceSpecification) {
        if (spec.priceType === SCHEMA_SALE_PRICE) {
          spec.price = salePrice;
        } else if (spec.priceType === SCHEMA_LIST_PRICE) {
          spec.price = listPrice ?? spec.price;
        }
      }
    }

    if (changed) {
      product.offers = aggregateOffers(
        product.offers.offers,
        product.offers.priceCurrency,
      );
    }
  };

  for (const p of products) {
    fixOffer(p);
    if (p.isVariantOf) {
      for (const variant of p.isVariantOf.hasVariant) {
        fixOffer(variant);
      }
    }
  }

  return products;
};
