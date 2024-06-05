import { AppContext } from "../../mod.ts";

export interface Props {
  product_id: number;
  customer_id: number;
  nickname: string;
  title: string;
  detail: string;
  ratings: { [key: string]: string };
  path: string;
}

const loader = async (props: Props, _req: Request, ctx: AppContext) =>
  await ctx.clientCustom["POST /rest/:reviewUrl"](
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
        ratings: props.ratings,
        store_id: `${ctx.storeId}`,
      },
    }
  );

  export default loader