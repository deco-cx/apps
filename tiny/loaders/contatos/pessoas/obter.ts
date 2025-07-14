import { AppContext } from "../../../mod.ts";
import { ObterContatoContatoModelResponse } from "../../../types.ts";

export interface Props {
  /**
   * @title Contact ID
   * @description ID of the contact that the person belongs to
   */
  idContato: number;

  /**
   * @title Person ID
   * @description ID of the person to retrieve
   */
  idPessoa: number;
}

/**
 * @title Get Person Details
 * @description Retrieves details of a specific person associated with a contact
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObterContatoContatoModelResponse> => {
  try {
    const { idContato, idPessoa } = props;

    const response = await ctx.api
      ["GET /contatos/:idContato/pessoas/:idPessoa"]({
        idContato,
        idPessoa,
      });

    if (!response.ok) {
      throw new Error(`Failed to get person details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching person details:", error);
    throw error;
  }
};

export default loader;
