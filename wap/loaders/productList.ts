import { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { WapProductsListPage, WapProductsShowcasePage } from "../utils/type.ts";

export interface ShowcaseProps {
  hash: string;
}

export interface QueryProps {
  busca: string;
  /**
   * @max 100
   * @default 12
   */
  limit: number;
}

export type Props = { props: ShowcaseProps | QueryProps };

// deno-lint-ignore no-explicit-any
const isShowcaseList = (p: any): p is ShowcaseProps =>
  typeof p.hash === "string";

/**
 * @title Wap Integration
 * @description Product List loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;

  const data = isShowcaseList(props.props)
    ? await api["GET /api/v2/front/showcase/products/:hash"]({
      ...props.props,
    }).then((response) => response.json())
    : await api
      ["GET /api/v2/front/url/product/listing/search"]({
        ...props.props,
        limit: String(props.props.limit),
        offset: "0",
      }).then((response) => response.json());

  if (!data) return null;

  const rawProducts = isShowcaseList(props.props)
    ? (data as WapProductsShowcasePage).produtos
    : (data as WapProductsListPage).conteudo.produtos;

  const products = rawProducts.map((produto) => toProduct(produto, baseUrl));

  return products;
};

export default loader;
