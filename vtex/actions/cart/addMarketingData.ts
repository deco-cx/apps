import { AppContext } from "../../mod.ts";
import { MarketingData, OrderForm } from "../../utils/types.ts";
import { parseCookie } from "../../utils/orderForm.ts";

export interface Props {
    marketingData: MarketingData;
}

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
    const { vcs } = ctx;
    const { orderFormId } = parseCookie(req.headers);
    const cookie = req.headers.get("cookie") ?? "";
    const { marketingData } = props
    try{
        const response = await vcs["POST /api/checkout/pub/orderForm/:orderFormId/attachments/marketingData"]({
            orderFormId,
        }, {
            body: { ...marketingData },
            headers: {
                "content-type": "application/json",
                accept: "application/json",
                cookie,
            },
        });
        return response.json() as Promise<OrderForm>;

    }catch(error){
      console.error(error)
      throw error;
    }
};

export default action;
