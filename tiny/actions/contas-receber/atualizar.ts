import { AppContext } from "../../mod.ts";
import { AtualizarContaReceberRequestModel } from "../../types.ts";

export interface Props extends AtualizarContaReceberRequestModel {
  /**
   * @title Account ID
   * @description ID of the receivable account to update
   */
  idContaReceber: number;
}

/**
 * @title Update Receivable Account
 * @description Updates an existing receivable account
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idContaReceber, ...updateData } = props;

    const response = await ctx.api["PUT /contas-receber/:idContaReceber"](
      { idContaReceber },
      { body: updateData },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update receivable account: ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error updating receivable account:", error);
    throw error;
  }
};

export default action;
