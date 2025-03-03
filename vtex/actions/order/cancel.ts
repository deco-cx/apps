import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  orderId: string;
  reason: string;
}

const mutation = `mutation cancelOrder($orderId: ID!, $reason: String!) {
  cancelOrder(input: { orderId: $orderId, reason: $reason }) @context(provider: "vtex.orders-graphql@0.107.3") {
    order {
      cacheId
      clientProfileData {
        email
        firstName
        lastName
      }
      status
    }
  }
}`;

interface CancelOrderResult {
  order: {
    cacheId: string;
    clientProfileData: {
      email: string;
      firstName: string;
      lastName: string;
    };
    status: string;
  };
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CancelOrderResult | null> {
  const { io } = ctx;
  const { orderId, reason } = props;
  const { cookie } = parseCookie(req.headers, ctx.account);

  try {
    const result = await io.query<
      CancelOrderResult,
      { orderId: string; reason: string }
    >(
      {
        query: mutation,
        operationName: "cancelOrder",
        variables: {
          orderId,
          reason,
        },
      },
      { headers: { cookie } },
    );

    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default action;
