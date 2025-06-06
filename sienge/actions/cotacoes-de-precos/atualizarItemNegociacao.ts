import { State } from "../../mod.ts";
import {
  createPurchaseQuotationsClient,
  PurchaseQuotationNegotiationItemUpdate,
} from "../../clients/purchaseQuotations.ts";

export interface Props extends PurchaseQuotationNegotiationItemUpdate {
  purchaseQuotationId: number;
  supplierId: number;
  negotiationNumber: number;
  quotationItemNumber: number;
}

/**
 * @title Atualizar item de negociação
 * @description Atualiza item de negociação de cotação de preço com fornecedor
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<void> => {
  const {
    purchaseQuotationId,
    supplierId,
    negotiationNumber,
    quotationItemNumber,
    ...itemData
  } = props;
  const client = createPurchaseQuotationsClient(ctx.state);
  await client
    ["PUT /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations/:negotiationNumber/items/:quotationItemNumber"](
      {
        purchaseQuotationId,
        supplierId,
        negotiationNumber,
        quotationItemNumber,
      },
      { body: itemData },
    );
};

export default action;
