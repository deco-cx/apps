import { State } from "../../mod.ts";
import {
  createPurchaseQuotationsClient,
  PurchaseRequestItemDeliveryRequirementInsert,
} from "../../clients/purchaseQuotations.ts";

export interface Props extends PurchaseRequestItemDeliveryRequirementInsert {
  purchaseQuotationId: number;
}

/**
 * @title Criar item de cotação de preço a partir de solicitação
 * @description Cria um novo item em uma cotação de preço a partir de uma entrega de item de solicitação de compra
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<void> => {
  const { purchaseQuotationId, ...itemData } = props;
  const client = createPurchaseQuotationsClient(ctx.state);
  await client
    ["POST /purchase-quotations/:purchaseQuotationId/items/from-purchase-request"](
      { purchaseQuotationId },
      { body: itemData },
    );
};

export default action;
