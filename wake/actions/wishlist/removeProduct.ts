import { AppContext } from "../../mod.ts";
import { WishlistRemoveProduct } from "../../utils/graphql/queries.ts";
import {
  WishlistReducedProductFragment,
  WishlistRemoveProductMutation,
  WishlistRemoveProductMutationVariables,
} from "../../utils/graphql/storefront.graphql.gen.ts";

import { ProductFragment } from "../../utils/graphql/storefront.graphql.gen.ts";
import authenticate from "../../utils/authenticate.ts";
import { parseHeaders } from "../../utils/parseHeaders.ts";

export interface Props {
  productId: number;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<WishlistReducedProductFragment[] | null> => {
  const { storefront } = ctx;
  const { productId } = props;

  const headers = parseHeaders(req.headers);

  const customerAccessToken = await authenticate(req, ctx);

  if (!customerAccessToken) return [];

  const data = await storefront.query<
    WishlistRemoveProductMutation,
    WishlistRemoveProductMutationVariables
  >({
    variables: { customerAccessToken, productId },
    ...WishlistRemoveProduct,
  }, { headers });

  const products = data.wishlistRemoveProduct;

  if (!Array.isArray(products)) {
    return null;
  }

  return products
    .filter((node): node is ProductFragment => Boolean(node))
    .map(({ productId, productName }) => ({
      productId,
      productName,
    }));
};

export default action;
