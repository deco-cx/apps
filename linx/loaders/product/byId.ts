import { Product } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { toProduct } from "../../utils/transform.ts";

export interface Props {
  id: string;
}

/**
 * @title Linx Integration
 * @description Get Product by ID
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product | null> => {
  const { api, cdn } = ctx;
  const url = req.url;
  const response = await api["GET /web-api/v1/Catalog/Products/Get"]({
    ...props,
  });

  if (response === null) {
    return null;
  }

  const result = await response.json();

  return toProduct(
    result.Products[0],
    result.Products[0].ProductSelection?.SkuID,
    {
      cdn,
      url,
      currency: "BRL",
    },
  );
};

export default loader;
