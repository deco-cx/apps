import { State } from "../../mod.ts";
import { createPurchaseQuotationsClient } from "../../clients/purchaseQuotations.ts";

export interface Props {
  purchaseQuotationId: number;
  supplierId: number;
}

/**
 * @title Criar negociação com fornecedor
 * @description Cria uma nova negociação de cotação de preço para um fornecedor
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<void> => {
  const { purchaseQuotationId, supplierId } = props;
  const client = createPurchaseQuotationsClient(ctx.state);
  await client
    ["POST /purchase-quotations/:purchaseQuotationId/suppliers/:supplierId/negotiations"](
      { purchaseQuotationId, supplierId },
    );
};

export default action;
