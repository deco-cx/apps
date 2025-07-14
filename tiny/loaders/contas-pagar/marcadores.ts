import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the account payable
   */
  idContaPagar: number;
}

/**
 * @title Get Account Payable Tags
 * @description Retrieves tags associated with a specific account payable
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  try {
    const { idContaPagar } = props;

    const response = await ctx.api
      ["GET /contas-pagar/:idContaPagar/marcadores"]({
        idContaPagar,
      });

    return await response.json();
  } catch (error) {
    console.error("Error getting account payable tags:", error);
    throw error;
  }
};

export default loader;
