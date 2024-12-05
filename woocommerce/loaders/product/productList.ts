import { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { toProduct } from "../../utils/transform.ts";
import { Order, OrderBy, Status, StockStatus } from "../../utils/types.ts";

export interface SearchProps {
  search: string;
}

export interface ProductIDProps {
  ids: string[];
}

export interface Props {
  props: SearchProps | ProductIDProps;
  /**
   * @title Per Page
   * @default 10
   * @description Maximum number of items to be returned in result set. Default is 10.
   */
  per_page?: number;
  /**
   * @description Order sort attribute ascending or descending. Default is desc.
   */
  order?: Order;
  /**
   * @title Order By
   * @description Sort collection by object attribute. Default is date.
   */
  orderby?: OrderBy;
  /**
   * @title Status
   * @description Limit result set to products assigned a specific status. Options: any, draft, pending, private and publish. Default is any.
   */
  status?: Status;
  /**
   * @title Stock Status
   * @description Limit result set to products with specified stock status. Default: instock.
   */
  stock_status?: StockStatus;
  /**
   * @title Exclude IDs
   * @description Ensure result set excludes specific IDs.
   */
  exclude?: string[];
}

async function loader(
  p: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  const { api } = ctx;

  const props = p.props ??
    (p as unknown as Props["props"]);

  let products;

  const queryParams: Omit<Props, "props"> = {
    order: p.order ?? "desc",
    orderby: p.orderby ?? "date",
    status: p.status ?? "any",
    stock_status: p.stock_status ?? "instock",
    per_page: p.per_page,
    exclude: p.exclude,
  };

  if ("search" in props) {
    products = await api["GET /wc/v3/products"]({
      search: props.search,
      ...queryParams,
    }).then((res) => res.json());
  }

  if ("ids" in props) {
    products = await api["GET /wc/v3/products"]({
      include: props.ids,
      ...queryParams,
    }).then((res) => res.json());
  }

  if (!products) return null;

  return products.map((product) => toProduct(product));
}

export default loader;
