import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Serviço
   * @description ID da ordem de serviço para gerar a nota fiscal
   */
  idOrdemServico: number;

  /**
   * @title Modelo
   * @description Modelo da nota fiscal (NFe ou NFCe)
   */
  modelo?: "nfe" | "nfce";

  /**
   * @title Gerar DANFE
   * @description Se deve gerar o DANFE (Documento Auxiliar da Nota Fiscal Eletrônica)
   */
  gerarDanfe?: boolean;

  /**
   * @title Email
   * @description Email para enviar a nota fiscal
   */
  email?: string;
}

/**
 * @title Gerar Nota Fiscal da Ordem de Serviço
 * @description Gera uma nota fiscal a partir de uma ordem de serviço
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ idNota: number }> => {
  try {
    const { idOrdemServico, ...requestBody } = props;

    const response = await ctx.api
      ["POST /ordem-servico/:idOrdemServico/gerar-nota-fiscal"]({
        idOrdemServico,
      }, {
        body: requestBody,
      });

    return await response.json();
  } catch (error) {
    console.error("Erro ao gerar nota fiscal da ordem de serviço:", error);
    throw error;
  }
};

export default action;
