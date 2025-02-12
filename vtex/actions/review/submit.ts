import { getCookies } from "std/http/cookie.ts";
import { AppContext } from "../../../vtex/mod.ts";
import { VTEX_ID_CLIENT_COOKIE } from "../../utils/vtexId.ts";

export interface Props {
  data: {
    productId: string;
    rating: number;
    title: string;
    text: string;
    reviewerName: string;
    approved: boolean;
  };
}

// docs https://developers.vtex.com/docs/api-reference/reviews-and-ratings-api#post-/reviews-and-ratings/api/review?endpoint=post-/reviews-and-ratings/api/review

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
) => {
  const { data } = props;
  const cookies = getCookies(req.headers);
  const authCookie = cookies[VTEX_ID_CLIENT_COOKIE] ||
    cookies[`${VTEX_ID_CLIENT_COOKIE}_${ctx.account}`];

  const requestOptions = {
    body: data,
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "VtexidClientAutCookie": authCookie,
    },
  };

  const response = await (
    ctx.my[`POST /reviews-and-ratings/api/review`]({}, requestOptions)
  );

  return response.json();
};

export default action;
