import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Tax note ID
   */
  idNota: number;
}

/**
 * @title Launch Tax Note Inventory
 * @description Launches inventory/stock entries from a tax note
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idNota } = props;

    const response = await ctx.api["POST /notas/:idNota/lancar-estoque"]({
      idNota,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to launch inventory from tax note: ${
          JSON.stringify(errorData)
        }`,
      );
    }

    return;
  } catch (error) {
    console.error(
      `Error launching inventory for tax note ID ${props.idNota}:`,
      error,
    );
    throw error;
  }
};

export default action;
