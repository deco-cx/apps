import { AppContext } from "../../mod.ts";
import { ObterContatoModelResponse } from "../../types.ts";

export interface Props {
  /**
   * @title Contact ID
   * @description ID of the contact to retrieve
   */
  idContato: number;
}

/**
 * @title Get Contact Details
 * @description Retrieves details of a specific contact
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObterContatoModelResponse> => {
  try {
    const { idContato } = props;

    const response = await ctx.api["GET /contatos/:idContato"]({
      idContato,
    });

    if (!response.ok) {
      throw new Error(`Failed to get contact: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
};

export default loader;
