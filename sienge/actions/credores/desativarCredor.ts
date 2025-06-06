import { AppContext } from "../../mod.ts";
import { createCreditorsClient } from "../../clients/creditors.ts";

export interface Props {
  /**
   * @title ID do Credor
   * @description ID único do credor no Sienge
   */
  creditorId: number;
}

/**
 * @title Desativar Credor
 * @description Desativa um credor que está ativo no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const creditorsClient = createCreditorsClient(ctx);

  try {
    await creditorsClient["PUT /creditors/:creditorId/deactivate"]({
      creditorId: props.creditorId,
    });
  } catch (error) {
    console.error("Erro ao desativar credor:", error);
    throw new Error(
      `Erro ao desativar credor: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

export default action;
