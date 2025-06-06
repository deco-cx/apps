import { AppContext } from "../../mod.ts";
import { AtualizarContatoModelRequest } from "../../types.ts";

export interface Props extends AtualizarContatoModelRequest {
  /**
   * @title Contact ID
   * @description ID of the contact to update
   */
  idContato: number;
}

/**
 * @title Update Contact
 * @description Updates an existing contact
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idContato, ...updateData } = props;

    const response = await ctx.api["PUT /contatos/:idContato"](
      { idContato },
      { body: updateData },
    );

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

export default action;
