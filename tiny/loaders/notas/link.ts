import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Tax note ID
   */
  idNota: number;
}

interface ObterLinkNotaFiscalResponse {
  link: string;
}

/**
 * @title Get Tax Note DANFE Link
 * @description Gets a link to access the DANFE (tax document) of a specific tax note
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObterLinkNotaFiscalResponse> => {
  try {
    const { idNota } = props;
    const response = await ctx.api["GET /notas/:idNota/link"]({
      idNota,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Error getting DANFE link for tax note ID ${props.idNota}:`,
      error,
    );
    throw error;
  }
};

export default loader;
