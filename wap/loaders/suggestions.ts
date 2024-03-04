import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { WapProductsListPage } from "../utils/type.ts";
import { Suggestion } from "../../commerce/types.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;
}

/**
 * @title Wap Integration
 * @description Product Suggestion loader
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;
  const { query, count = 4 } = props;

  const data = await api
    ["GET /api/v2/front/url/product/listing/search"]({
      busca: query,
      limit: String(count),
      offset: String(0),
    }).then((response) => response.json()) as WapProductsListPage;

  const products = data.conteudo.produtos.map((produto) =>
    toProduct(produto, baseUrl)
  );

  return {
    products,
  };
};

export default loaders;
