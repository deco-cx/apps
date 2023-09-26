import { AppContext } from "../mod.ts";
import { ReviewForm } from "../utils/types.ts";

export interface Props {
  /**
   * @title Page Id
   * @description Empty if you are using param page_id at your page
   */
  pageId?: string;
}

/**
 * @title Power Reviews - Form Fields
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ReviewForm | null> => {
  const { apiWrite, merchantId } = ctx;
  const url = new URL(req.url);
  const urlParams = url.searchParams;
  const id = urlParams.get("pr_page_id") || props.pageId;

  if (!id) {
    return null;
  }

  const review = await apiWrite
    ["GET /war/writereview"]({
      "merchant_id": merchantId,
      "page_id": id,
    });

  if (review.ok) return await review.json();

  return null;
};

export default loader;
