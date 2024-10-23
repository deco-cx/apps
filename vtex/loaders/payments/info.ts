import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

const query = `query getPaymentSystems {
  paymentSystems {
    name
    groupName
    requiresDocument
    displayDocument
    validator {
      regex
      mask
      cardCodeMask
      cardCodeRegex
    }
  }
}`;

export interface PaymentSystem {
  name: string;
  groupName: string;
  requiresDocument: boolean;
  displayDocument: boolean;
  validator: {
    regex: string | null;
    mask: string | null;
    cardCodeMask: string | null;
    cardCodeRegex: string | null;
  };
}

export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
) {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  try {
    const data = await io.query<{ paymentSystems: PaymentSystem[] }, null>(
      { query },
      { headers: { cookie } },
    );

    return data.paymentSystems;
  } catch (e) {
    console.error(e);
    return null;
  }
}
