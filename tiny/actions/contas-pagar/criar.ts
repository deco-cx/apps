import { AppContext } from "../../mod.ts";
import {
  CriarContaPagarRequestModel,
  CriarContaPagarResponseModel,
} from "../../types.ts";

export type Props = CriarContaPagarRequestModel;

/**
 * @title Create Payable Account
 * @description Creates a new account payable entry
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CriarContaPagarResponseModel> => {
  try {
    const response = await ctx.api["POST /contas-pagar"]({}, {
      body: props,
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating payable account:", error);
    throw error;
  }
};

export default action;
