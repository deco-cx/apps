import type { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";

export type Props = {
  page: number;
  pagesize: number;
};

/**
 * @title Product[] Loader Workflow
 * @description DO NOT USE this on your store front
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[]> => {
  const { vcs } = ctx;

  const ids = await vcs
    ["GET /api/catalog_system/pvt/sku/stockkeepingunitids"](props)
    .then((res) => res.json());

  return ids.map((productID) => ({
    "@type": "Product",
    productID: `${productID}`,
    sku: `${productID}`,
  }));
};

export default loader;
