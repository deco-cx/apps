import { AppContext } from "../../mod.ts";

export interface Props {
  codigo?: string;
  nome: string;
  preco: number;
  precoCusto?: number;
  descricao?: string;
  unidade?: string;
  peso?: number;
  gtin?: string;
  idMarca?: number;
  idCategoria?: number;
  ativo?: boolean;
}

interface ProdutoResponse {
  id: number;
  codigo?: string;
  nome: string;
  preco: number;
  precoCusto?: number;
  descricao?: string;
  unidade?: string;
  peso?: number;
  gtin?: string;
  idMarca?: number;
  idCategoria?: number;
  ativo: boolean;
  dataCriacao: string;
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

    return await response.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export default action;
