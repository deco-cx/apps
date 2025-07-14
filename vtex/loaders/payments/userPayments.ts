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
