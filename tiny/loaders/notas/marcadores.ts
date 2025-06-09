import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Tax note ID
   */
  idNota: number;
}

interface Marcador {
  id: number;
  nome: string;
  cor: string;
}

/**
 * @title Get Tax Note Markers
 * @description Gets the markers associated with a specific tax note
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Marcador[]> => {
  try {
    const { idNota } = props;
    const response = await ctx.api["GET /notas/:idNota/marcadores"]({
      idNota,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Error getting markers for tax note ID ${props.idNota}:`,
      error,
    );
    throw error;
  }
};

export default loader;
