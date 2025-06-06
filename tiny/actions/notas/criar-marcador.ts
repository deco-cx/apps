import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Tax note ID
   */
  idNota: number;

  /**
   * @description Marker name
   */
  nome: string;

  /**
   * @description Marker color
   */
  cor: string;
}

/**
 * @title Create Tax Note Marker
 * @description Creates a marker for a specific tax note
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idNota, ...markerData } = props;

    const response = await ctx.api["POST /notas/:idNota/marcadores"]({
      idNota,
    }, {
      body: [markerData], // API expects an array of markers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create tax note marker: ${JSON.stringify(errorData)}`,
      );
    }

    return;
  } catch (error) {
    console.error(
      `Error creating marker for tax note ID ${props.idNota}:`,
      error,
    );
    throw error;
  }
};

export default action;
