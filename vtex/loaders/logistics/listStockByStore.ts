import type { AppContext } from "../../mod.ts";
import type { ProductBalance } from "../../utils/types.ts";

interface Props {
  /**
   * @description Product SKU
   */
  skuId: number;
}

/**
 * @title List Stock
 * @description List stock by SKU
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProductBalance[]> {
  const { skuId } = props;
  const { vcs } = ctx;

  try {
    const stockByStore = await vcs
      ["GET /api/logistics/pvt/inventory/skus/:skuId"]({ skuId })
      .then((r) => r.json()) as {
        skuId?: string;
        balance?: ProductBalance[];
      };

    return stockByStore.balance || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, _req: Request, _ctx: AppContext) => {
  return `stock-${props.skuId}`;
};
