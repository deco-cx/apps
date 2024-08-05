import { AppContext } from "../../../vtex/mod.ts";
import type { CreateNewDocument } from "../../../vtex/utils/types.ts";

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
  
  // deno-lint-ignore no-explicit-any
  const { my }: any = await ctx.invoke.vtex.loaders.config() 
  const { data } = props;
  const cookie = req.headers.get('cookie');
  const arrCookie = cookie?.split(';');
  const finalCookie = arrCookie?.find((item) => item.includes("VtexIdclientAutCookie"))?.split('=')[1]?.trim();

  const requestOptions = {
    body: data,
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "VtexidClientAutCookie": finalCookie
    },
  };

  const response =
    await (
      my[`POST /reviews-and-ratings/api/review`]({}, requestOptions)
    );

  return response.json();
};

export default action;
