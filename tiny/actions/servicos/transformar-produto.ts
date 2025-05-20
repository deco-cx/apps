import { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Service ID
   */
  idServico: number;

  /**
   * @description Optional product code
   */
  codigo?: string;

  /**
   * @description Optional product description
   */
  descricao?: string;

  /**
   * @description Optional cost price
   */
  precoCusto?: number;

  /**
   * @description Optional product unit
   */
  unidade?: string;

  /**
   * @description Optional product weight
   */
  peso?: number;

  /**
   * @description Optional product GTIN/EAN/barcode
   */
  gtin?: string;

  /**
   * @description Optional brand ID
   */
  idMarca?: number;

  /**
   * @description Optional category ID
   */
  idCategoria?: number;

  /**
   * @description Optional active status
   */
  ativo?: boolean;
}

interface TransformarServicoResponse {
  /**
   * @description The ID of the created product
   */
  idProduto: number;
}

/**
 * @title Transform Service into Product
 * @description Transforms an existing service into a product
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TransformarServicoResponse> => {
  try {
    const { idServico, ...requestBody } = props;

    const response = await ctx.api
      ["POST /servicos/:idServico/transformar-produto"]({
        idServico,
      }, {
        body: requestBody,
      });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to transform service into product: ${
          JSON.stringify(errorData)
        }`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error transforming service ID ${props.idServico} into product:`,
      error,
    );
    throw error;
  }
};

export default action;
