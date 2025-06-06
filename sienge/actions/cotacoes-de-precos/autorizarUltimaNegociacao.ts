import { State } from "../../mod.ts";
import { createPurchaseQuotationsClient } from "../../clients/purchaseQuotations.ts";

export interface Props {
  purchaseQuotationId: number;
  supplierId: number;
}

/**
 * @title Autorizar última negociação
 * @description Autoriza a última negociação de cotação de preços para o fornecedor
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<void> => {
  const { purchaseQuotationId, supplierId } = props;
  const client = createPurchaseQuotationsClient(ctx.state);
  await client
    ["PATCH /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations/latest/authorize"](
      { purchaseQuotationId, supplierId },
    );
};

export default action;
