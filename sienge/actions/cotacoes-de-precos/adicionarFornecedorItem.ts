import { State } from "../../mod.ts";
import {
  createPurchaseQuotationsClient,
  PurchaseQuotationItemSupplierInsert,
} from "../../clients/purchaseQuotations.ts";

export interface Props extends PurchaseQuotationItemSupplierInsert {
  purchaseQuotationId: number;
  purchaseQuotationItemNumber: number;
}

/**
 * @title Adicionar fornecedor ao item de cotação
 * @description Adiciona um fornecedor a um item específico de uma cotação de preço
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: { state: State },
): Promise<void> => {
  const { purchaseQuotationId, purchaseQuotationItemNumber, ...supplierData } =
    props;
  const client = createPurchaseQuotationsClient(ctx.state);
  await client
    ["POST /purchase-quotations/:purchaseQuotationId/items/:purchaseQuotationItemNumber/suppliers"](
      { purchaseQuotationId, purchaseQuotationItemNumber },
      { body: supplierData },
    );
};

export default action;
