import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title ID da Ordem de Serviço
   * @description ID da ordem de serviço a ser atualizada
   */
  idOrdemServico: number;

  /**
   * @title Nome
   * @description Nome ou número da ordem de serviço
   */
  nome?: string;

  /**
   * @title Situação
   * @description Situação da ordem de serviço
   */
  situacao?: string;

  /**
   * @title ID do Cliente
   * @description ID do cliente relacionado à ordem de serviço
   */
  idCliente?: number;

  /**
   * @title Observação
   * @description Observações sobre a ordem de serviço
   */
  observacao?: string;

  /**
   * @title Itens
   * @description Itens da ordem de serviço (produtos ou serviços)
   */
  itens?: Array<{
    /**
     * @title ID do Item
     * @description ID do item na ordem de serviço (se for uma atualização)
     */
    id?: number;

    /**
     * @title Tipo
     * @description Tipo do item (produto ou serviço)
     */
    tipo: "produto" | "servico";

    /**
     * @title ID do Produto/Serviço
     * @description ID do produto ou serviço
     */
    idItem: number;

    /**
     * @title Quantidade
     * @description Quantidade do item
     */
    quantidade: number;

    /**
     * @title Valor Unitário
     * @description Valor unitário do item (opcional)
     */
    valorUnitario?: number;
  }>;
}

/**
 * @title Atualizar Ordem de Serviço
 * @description Atualiza uma ordem de serviço existente
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  try {
    const { idOrdemServico, ...requestBody } = props;

    await ctx.api["PUT /ordem-servico/:idOrdemServico"]({
      idOrdemServico,
    }, {
      body: requestBody,
    });
  } catch (error) {
    console.error("Erro ao atualizar ordem de serviço:", error);
    throw error;
  }
};

export default action;
