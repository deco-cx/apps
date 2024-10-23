import { AppContext } from "../mod.ts";
import {
  ContextInformation,
  ReviewFormField,
  WriteReviewResponse,
} from "../utils/types.ts";

export interface Props {
  /**
   * @title Page Id
   * @description probably your product slug
   */
  pageId: string;

  payload: {
    context_information: ContextInformation;
    fields: ReviewFormField[];
  };
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<WriteReviewResponse> => {
  const { apiWrite, merchantId } = ctx;

  const { pageId, payload } = props;

  const response = await apiWrite["POST /war/writereview"]({
    "merchant_id": merchantId,
    "page_id": pageId,
  }, {
    body: {
      ...payload,
    },
  });

  return await response.json() as WriteReviewResponse;
};

export default action;
