import { AppContext } from "../../mod.ts";
import { ObterContaPagarModelResponse } from "../../types.ts";

export interface Props {
  /**
   * @description ID of the account payable
   */
  idContaPagar: number;
}

/**
 * @title Get Account Payable Details
 * @description Retrieves details of a specific account payable
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObterContaPagarModelResponse> => {
  try {
    const { idContaPagar } = props;

    const response = await ctx.api["GET /contas-pagar/:idContaPagar"]({
      idContaPagar,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get account payable details: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting account payable details:", error);
    throw error;
  }
};

export default loader;
