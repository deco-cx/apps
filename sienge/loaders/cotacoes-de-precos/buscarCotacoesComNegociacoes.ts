import { AppContext } from "../../mod.ts";
import { PaginatedResponseOfPurchaseQuotationWithNegotiation } from "../../clients/purchaseQuotations.ts";
import { createPurchaseQuotationsClient } from "../../clients/purchaseQuotations.ts";

export interface Props {
  quotationNumber?: number;
  supplierId?: number;
  buyerId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * @title Buscar cotações de preço com negociações
 * @description Retorna uma lista paginada de cotações de preço com negociações
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PaginatedResponseOfPurchaseQuotationWithNegotiation> => {
  const client = createPurchaseQuotationsClient(ctx);
  const response = await client["GET /purchase-quotations/all/negotiations"]({
    ...props,
  });
  return await response.json();
};

export default loader;
