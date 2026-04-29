import type { ProductDetailsPage } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import type { ProductListToId } from "../../utils/types.ts";

interface Props {
  /**
   * @title Page
   */
  page: ProductDetailsPage | null;
}

/**
 * @title Product ID from Page
 * @description Get product ID from the page
 */
export default function loader(
  props: Props,
  _req: Request,
  _ctx: AppContext,
): ProductListToId {
  const { page } = props;
  const id = page?.product?.inProductGroupWithID;

  if (!id) {
    return [];
  }

  return [id];
}
