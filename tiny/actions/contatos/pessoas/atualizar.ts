import { AppContext } from "../../../mod.ts";
import { AtualizarContatoContatoModelRequest } from "../../../types.ts";

export interface Props extends AtualizarContatoContatoModelRequest {
  idContato: number;
  idPessoa: number;
}

/**
 * @title Update Contact Person
 * @description Updates a person associated with a contact
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idContato, idPessoa, ...body } = props;

    const response = await ctx.api
      ["PUT /contatos/:idContato/pessoas/:idPessoa"]({
        idContato,
        idPessoa,
      }, {
        body,
      });

    if (!response.ok) {
      throw new Error(
        `Failed to update contact person: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error updating contact person:", error);
    throw error;
  }
};

export default action;
