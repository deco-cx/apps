import { AppContext } from "../../../mod.ts";
import {
  CriarContatoContatoModelRequest,
  CriarContatoContatoModelResponse,
} from "../../../types.ts";

export interface Props extends CriarContatoContatoModelRequest {
  idContato: number;
}

/**
 * @title Add Contact Person
 * @description Adds a person to a specific contact
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CriarContatoContatoModelResponse> => {
  try {
    const { idContato, ...body } = props;

    const response = await ctx.api["POST /contatos/:idContato/pessoas"]({
      idContato,
    }, {
      body,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to add person to contact: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding person to contact:", error);
    throw error;
  }
};

export default action;
