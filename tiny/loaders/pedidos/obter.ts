import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description ID of the order
   */
  idPedido: number;
}

interface PedidoItemModel {
  id: number;
  idProduto: number;
  nomeProduto: string;
  quantidade: number;
  valor: number;
  descontoItem?: number;
  observacao?: string;
}

interface EnderecoEntregaModel {
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
}

interface PedidoResponse {
  id: number;
  numero: string;
  situacao: string;
  data: string;
  dataCriacao: string;
  dataAtualizacao?: string;
  valor: number;
  valorFrete?: number;
  formaPagamento?: string;
  formaEnvio?: string;
  observacao?: string;
  idContato?: number;
  nomeContato?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  idVendedor?: number;
  nomeVendedor?: string;
  itens: PedidoItemModel[];
  enderecoEntrega?: EnderecoEntregaModel;
}

/**
 * @title Get Order Details
 * @description Retrieves details of a specific order
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PedidoResponse> => {
  try {
    const { idPedido } = props;

    const response = await ctx.api["GET /pedidos/:idPedido"]({
      idPedido,
    });

    return await response.json();
  } catch (error) {
    console.error("Error getting order details:", error);
    throw error;
  }
};

export default loader;
