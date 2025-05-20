import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Nome
   * @description Nome ou número da ordem de serviço
   */
  nome: string;

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
 * @title Criar Ordem de Serviço
 * @description Cria uma nova ordem de serviço
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  id: number;
  numero: string;
  nome: string;
  situacao: string;
  dataCriacao: string;
}> => {
  try {
    const response = await ctx.api["POST /ordem-servico"]({}, {
      body: props,
    });

    return await response.json();
  } catch (error) {
    console.error("Erro ao criar ordem de serviço:", error);
    throw error;
  }
};

export default action;
