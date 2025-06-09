import { State } from "../../mod.ts";
import {
  createPurchaseQuotationsClient,
  PurchaseQuotationItemInsert,
} from "../../clients/purchaseQuotations.ts";

export interface Props extends PurchaseQuotationItemInsert {
  purchaseQuotationId: number;
}

/**
 * @title Criar item de cotação de preço
 * @description Cria um novo item em uma cotação de preço existente
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<void> => {
  const { purchaseQuotationId, ...itemData } = props;
  const client = createPurchaseQuotationsClient(ctx.state);
  await client["POST /purchase-quotations/:purchaseQuotationId/items"]({
    purchaseQuotationId,
  }, { body: itemData });
};

export default action;
