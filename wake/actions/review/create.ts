import { AppContext } from "../../mod.ts";
import { CreateProductReview } from "../../utils/graphql/queries.ts";
import {
  CreateProductReviewMutation,
  CreateProductReviewMutationVariables,
  Review,
} from "../../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../../utils/parseHeaders.ts";

export interface Props {
  email: string;
  name: string;
  productVariantId: number;
  rating: number;
  review: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Review | null> => {
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const data = await storefront.query<
    CreateProductReviewMutation,
    CreateProductReviewMutationVariables
  >({
    variables: props,
    ...CreateProductReview,
  }, {
    headers,
  });

  return data.createProductReview ?? null;
};

export default action;
