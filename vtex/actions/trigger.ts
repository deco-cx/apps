import { AppContext } from "../mod.ts";

export interface Notification {
  /** @description SKU ID in VTEX **/
  idSKU: string;
  /** @description Product ID in VTEX **/
  productId: string;
  /** @description Seller’s account name in VTEX, shown in the store’s VTEX Admin url. **/
  an: string;
  /** @description Affiliate ID generated automatically in the configuration. **/
  idAffiliate: string;
  /** @description Date when the item was updated **/
  DateModified: string;
  /** @description Identifies whether the product is active or not. In case it is “false”, it means the product was deactivated in VTEX and should be blocked in the marketplace. We recommend that the inventory level is zeroed in the marketplace, and the product is blocked. In case the marketplace doesn’t allow it to be deactivated, the product should be excluded, along with any existing correspondences in the connector. **/
  isActive: string;
  /** @description Identifies that the inventory level has been altered. Connectors should send an Fulfillment Simulation request to collect updated information. **/
  StockModified: string;
  /** @description Identifies that the price has been altered. Connectors should send an Fulfillment Simulation request to collect updated information. **/
  PriceModified: string;
  /** @description Identifies that the product/SKU registration data has changed, like name, description, weight, etc **/
  HasStockKeepingUnitModified: string;
  /** @description Identifies that the product is no longer associated with the trade policy. In case the marketplace doesn’t allow it to be deactivated, the product should be excluded, along with any existing correspondences in the connector. **/
  HasStockKeepingUnitRemovedFromAffiliate: string;
}

const action = async (
  props: Notification,
  _req: Request,
  ctx: AppContext,
): Promise<{ id: string }> => {
  const { idSKU } = props;

  if (!idSKU) {
    throw new Error("Missing idSKU");
  }

  const response = await ctx.invoke("workflows/actions/start.ts", {
    // @ts-expect-error vtex trigger is on generated type
    key: "vtex-trigger",
    args: [props],
  });

  return { id: response.id };
};

export default action;
