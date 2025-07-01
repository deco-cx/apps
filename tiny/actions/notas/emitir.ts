import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Tax note ID
   */
  idNota: number;

  /**
   * @description Email to send the tax note
   */
  email?: string;

  /**
   * @description Indicates whether to generate a DANFE
   */
  gerarDanfe?: boolean;
}

/**
 * @title Issue Tax Note
 * @description Authorizes/issues a tax note in the tax authority system
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idNota, ...requestBody } = props;

    const response = await ctx.api["POST /notas/:idNota/emitir"]({
      idNota,
    }, {
      body: requestBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to issue tax note: ${JSON.stringify(errorData)}`);
    }

    return;
  } catch (error) {
    console.error(`Error issuing tax note ID ${props.idNota}:`, error);
    throw error;
  }
};

export default action;
