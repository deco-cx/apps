import { State } from "../../mod.ts";
import {
  createPurchaseQuotationsClient,
  PurchaseQuotationNegotiationUpdate,
} from "../../clients/purchaseQuotations.ts";

export interface Props extends PurchaseQuotationNegotiationUpdate {
  purchaseQuotationId: number;
  supplierId: number;
  negotiationNumber: number;
}

/**
 * @title Atualizar negociação
 * @description Atualiza uma negociação de cotação de preço de um fornecedor
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
    ...negotiationData
  } = props;
  const client = createPurchaseQuotationsClient(ctx.state);
  await client
    ["PUT /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations/:negotiationNumber"](
      { purchaseQuotationId, supplierId, negotiationNumber },
      { body: negotiationData },
    );
};

export default action;
