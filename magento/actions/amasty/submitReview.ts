import { AppContext } from "../../mod.ts";
import { SubmitReviewAmastyAPI } from "../../utils/client/types.ts";
import { Ratings as RatingsAPI } from "../../utils/client/types.ts";

export interface Props {
  /**
   * @title Path of the REST API
   */
  path: string;
  product_id: number;
  customer_id: number;
  nickname: string;
  title: string;
  detail: string;
  ratings: Array<Ratings>;
}

interface Ratings {
  key: string;
  value: string;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<SubmitReviewAmastyAPI> => {
  const { clientAdmin } = ctx;
  const ratings = props.ratings.reduce<RatingsAPI>((acc, rating) => {
    acc[`${rating.key}`] = rating.value;
    return acc;
  }, {});

  return await clientAdmin["POST /rest/:reviewUrl"](
    {
      reviewUrl: props.path.replace(/^\/?(rest\/)?/, ""),
    },
    {
      body: {
        product_id: props.product_id,
        customer_id: props.customer_id,
        nickname: props.nickname,
        title: props.title,
        detail: props.detail,
        ratings,
        store_id: `${ctx.storeId}`,
      },
    }
  ).then((r) => r.json());
};

export default loader;
