import { HttpError } from "../../../utils/http.ts";
import { AppContext } from "../../mod.ts";
import AddItems from "./addItems.ts";

export interface Props {
  productVariantId: number;
  quantity: number;
  customization: { customizationId: number; value: string }[];
  subscription: { subscriptionGroupId: number; recurringTypeId: number };
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Partial<CheckoutFragment>> => {
  return AddItems({ products: props }, req, ctx);
};

export default action;
