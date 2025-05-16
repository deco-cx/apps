import { AppContext } from "../../mod.ts";

export interface Props {
  codigo?: string;
  nome: string;
  preco: number;
  precoCusto?: number;
  /**
   * Product description - required field
   */
  descricao: string;
  /**
   * @description Product type - required field. Possible values: "S": Simples (Simple product), "K": Kit (Product kit/bundle), "V": Com variações (Product with variations), "F": Fabricado (Manufactured product) - may not be available, "M": Matéria-prima (Raw material)
   */
  tipo: string;
  /**
   * Stock Keeping Unit - required field
   */
  sku: string;
  unidade?: string;
  peso?: number;
  gtin?: string;
  idMarca?: number;
  idCategoria?: number;
  ativo?: boolean;
}

interface VariacaoProduto {
  id: number;
  codigo: string;
  descricao: string;
}

interface ProdutoResponse {
  id: number;
  codigo?: string;
  descricao?: string;
  // The other fields might not be returned in the response
  nome?: string;
  preco?: number;
  precoCusto?: number;
  unidade?: string;
  peso?: number;
  gtin?: string;
  idMarca?: number;
  idCategoria?: number;
  ativo?: boolean;
  dataCriacao?: string;
  variacoes?: VariacaoProduto[];
}

/**
 * @title Create Product
 * @description Creates a new product
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProdutoResponse> => {
  try {
    const response = await ctx.api["POST /produtos"]({}, {
      body: props,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create product: ${response.status} ${response.statusText}`,
      );
    }

    const responseData = await response.json();
    return responseData as ProdutoResponse;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export default action;
