import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Tax note ID
   */
  idNota: number;
}

interface ObterXmlNotaFiscalResponse {
  xml: string;
}

/**
 * @title Get Tax Note XML
 * @description Gets the XML document of a specific tax note
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObterXmlNotaFiscalResponse> => {
  try {
    const { idNota } = props;
    const response = await ctx.api["GET /notas/:idNota/xml"]({
      idNota,
    });

    return await response.json();
  } catch (error) {
    console.error(`Error getting XML for tax note ID ${props.idNota}:`, error);
    throw error;
  }
};

export default loader;
