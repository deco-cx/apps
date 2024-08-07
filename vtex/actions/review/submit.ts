import { AppContext } from "../../../vtex/mod.ts";
import type { CreateNewDocument } from "../../../vtex/utils/types.ts";
import { getCookies } from "std/http/cookie.ts";

export interface Props {
  data: {
    productId: string | null | undefined;
    rating: number;
    title: string;
    text: string;
    reviewerName: string;
    approved: boolean;
  }
}

// docs https://developers.vtex.com/docs/api-reference/reviews-and-ratings-api#post-/reviews-and-ratings/api/review?endpoint=post-/reviews-and-ratings/api/review

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CreateNewDocument | undefined> => {
  
  const { my } = await ctx.invoke.vtex.loaders.config() 
  const { data } = props;
  const cookies = getCookies(req.headers);
  const key = Object.keys(cookies).find((key) => key.includes("VtexIdclientAutCookie"));
  const authcookie = cookies[key ?? ""];

  const requestOptions = {
    body: data,
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "VtexidClientAutCookie": authcookie
    },
  };

  const response =
    await (
      my[`POST /reviews-and-ratings/api/review`]({}, requestOptions)
    );

  return response.json();
};

export default action;
