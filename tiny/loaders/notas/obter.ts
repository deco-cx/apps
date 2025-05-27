import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Tax note ID
   */
  idNota: number;
}

interface BaseNotaFiscalModel {
  situacao?: string;
  tipo?: string;
  numero?: string;
  serie?: string;
  chaveAcesso?: string;
  dataEmissao?: string;
  cliente: {
    id: number;
    nome?: string;
    fantasia?: string;
    tipoPessoa?: string;
    cpfCnpj?: string;
    ie?: string;
    rg?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cep?: string;
    cidade?: string;
    uf?: string;
    email?: string;
    fone?: string;
  };
}

interface NotaFiscalItemModel {
  idProduto?: number;
  codigo?: string;
  descricao?: string;
  unidade?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  cfop?: string;
}

interface NotaFiscalParcelaModel {
  dias?: number;
  data?: string;
  valor?: number;
  observacoes?: string;
  idFormaPagamento?: string;
  idMeioPagamento?: string;
}

interface ObterNotaFiscalResponse extends BaseNotaFiscalModel {
  id: number;
  finalidade?: string;
  regimeTributario?: number;
  dataInclusao?: string;
  numeroPedido?: string;
  itens?: NotaFiscalItemModel[];
  parcelas?: NotaFiscalParcelaModel[];
  observacoes?: string;
  valorFrete?: number;
  valorOutros?: number;
  valorTotal?: number;
  valorDesconto?: number;
  transportadora?: {
    id?: number;
    nome?: string;
    cpfCnpj?: string;
  };
}

/**
 * @title Get Tax Note Details
 * @description Gets detailed information about a specific tax note
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ObterNotaFiscalResponse> => {
  try {
    const { idNota } = props;
    const response = await ctx.api["GET /notas/:idNota"]({
      idNota,
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Error getting tax note details for ID ${props.idNota}:`,
      error,
    );
    throw error;
  }
};

export default loader;
