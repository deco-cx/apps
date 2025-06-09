import { AppContext } from "../../../mod.ts";

export interface Props {
  idContato: number;
  idPessoa: number;
}

/**
 * @title Delete Contact Person
 * @description Removes a person from a contact
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idContato, idPessoa } = props;

    const response = await ctx.api
      ["DELETE /contatos/:idContato/pessoas/:idPessoa"]({
        idContato,
        idPessoa,
      });

    if (!response.ok) {
      throw new Error(
        `Failed to delete contact person: ${response.status} ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error("Error deleting contact person:", error);
    throw error;
  }
};

export default action;
