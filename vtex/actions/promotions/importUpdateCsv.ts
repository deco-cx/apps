import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Props {
  /**
   * @description Promotion ID to update
   */
  promotionId: string;
  /**
   * @description CSV file content as base64 string or text
   */
  csvFile: string;
  /**
   * @description CSV headers mapping for promotion update
   * @example {"X-VTEX-calculator-name": "PromotionName", "X-VTEX-start-date": "2024-01-01"}
   */
  headers?: Record<string, string>;
}

export const defaultVisibility = "private";

/**
 * @title Import Promotions from CSV (Update)
 * @description Update promotions in bulk from a CSV file
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<unknown> => {
  const { vcs } = ctx;
  const { promotionId, csvFile, headers: customHeaders = {} } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const formData = new FormData();
  formData.append("file", new Blob([csvFile], { type: "text/csv" }));

  const response = await vcs[
    "POST /api/rnb/pvt/calculatorconfiguration/:idCalculatorConfiguration/import"
  ](
    { idCalculatorConfiguration: promotionId },
    {
      body: formData,
      headers: {
        ...customHeaders,
        cookie,
      },
    },
  );

  return response.json();
};

export default action;

