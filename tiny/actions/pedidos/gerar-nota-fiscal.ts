import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Order ID
   */
  idPedido: number;

  /**
   * @description Model key (default: "nfe")
   */
  modelo?: "nfe" | "nfce";

  /**
   * @description Indicates whether to generate a DANFE
   */
  gerarDanfe?: boolean;

  /**
   * @description Email to send the tax note
   */
  email?: string;
}

interface GerarNotaFiscalResponse {
  /**
   * @description Created tax note ID
   */
  idNota: number;
}

/**
 * @title Generate Tax Note from Order
 * @description Generates a tax note (invoice) from an existing order
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GerarNotaFiscalResponse> => {
  try {
    const { idPedido, ...requestBody } = props;

    const response = await ctx.api["POST /pedidos/:idPedido/gerar-nota-fiscal"](
      {
        idPedido,
      },
      {
        body: requestBody,
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to generate tax note from order: ${JSON.stringify(errorData)}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error generating tax note for order ID ${props.idPedido}:`,
      error,
    );
    throw error;
  }
};

export default action;
