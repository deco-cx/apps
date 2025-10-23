import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

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

export interface Payment {
  accountStatus: string | null;
  cardNumber: string;
  expirationDate: string;
  id: string;
  isExpired: boolean;
  paymentSystem: string;
  paymentSystemName: string;
}

/**
 * @title User Payments
 * @description List user payments
 */
async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Payment[]> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  const data = await io.query<
    { profile: { payments: Payment[] } | null },
    null
  >(
    { query },
    { headers: { cookie } },
  );

  if (!data.profile?.payments) {
    return [];
  }

  return data.profile.payments;
}

export const defaultVisibility = "private";
export default loader;
