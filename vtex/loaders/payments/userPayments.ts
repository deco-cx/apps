// fetch("https://www.als.com/_v/private/graphql/v1?workspace=master&maxAge=long&appsEtag=remove&domain=store&locale=en-US&__bindingId=d8649f18-3877-43de-88e6-c45a81eddc02", {
// 	"headers": {
// 		"content-type": "application/json",
// 	},
// 	"body": "{\"operationName\":\"Payments\",\"variables\":{},\"extensions\":{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"95af11127e44f1857144e38f18635e0d085113c3bfdda3e4b8bc99ae63e14e60\",\"sender\":\"vtex.my-cards@1.x\",\"provider\":\"vtex.store-graphql@2.x\"}}}",
// 	"method": "POST"
// })

import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface Payment {
  accountStatus: string | null;
  cardNumber: string;
  expirationDate: string;
  id: string;
  isExpired: boolean;
  paymentSystem: string;
  paymentSystemName: string;
}

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Payment[] | null> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const query = `query getUserPayments {
      profile {
        payments {
          accountStatus
          cardNumber
          expirationDate
          id
          isExpired
          paymentSystem
          paymentSystemName
        }
      }
  }`;

  try {
    const data = await io.query<{ profile: { payments: Payment[] } }, null>(
      { query },
      { headers: { cookie } },
    );

    return data.profile.payments;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default loader;
