import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the account receivable
   */
  idContaReceber: number;
}

/**
 * @title Get Account Receivable Details
 * @description Retrieves details of a specific account receivable
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  try {
    const { idContaReceber } = props;

    const response = await ctx.api["GET /contas-receber/:idContaReceber"]({
      idContaReceber,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting account receivable details:", error);
    throw error;
  }
};

export default loader;
