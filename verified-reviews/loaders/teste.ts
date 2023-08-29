import { AppContext } from "../mod.ts";

interface Message {
  message: string
}

interface Props {
  prefix: string
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm
 */
const loader = async (
  _props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Message> => {
  return {
    message: _props.prefix + ctx.suffix
  }
};

export default loader;
