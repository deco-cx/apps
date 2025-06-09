import { State } from "../../mod.ts";
import {
  createPurchaseQuotationsClient,
  PurchaseQuotationInsert,
} from "../../clients/purchaseQuotations.ts";

export interface Props extends PurchaseQuotationInsert {}

/**
 * @title Criar cotação de preço
 * @description Cria uma nova cotação de preço
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<void> => {
  const client = createPurchaseQuotationsClient(ctx.state);
  await client["POST /purchase-quotations"]({}, { body: props });
};

export default action;
