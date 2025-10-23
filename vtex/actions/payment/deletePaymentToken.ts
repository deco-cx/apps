import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface DeleteCard {
  deletePaymentToken: boolean;
}

const mutation = `mutation DeleteCreditCardToken($tokenId: ID!) {
  deletePaymentToken(tokenId: $tokenId) @context(provider: "vtex.my-cards-graphql@2.x")
}`;

interface Props {
  id: string;
}

/**
 * @title Delete Payment Token
 * @description Delete a payment token
 */
async function loader(
  { id }: Props,
  req: Request,
  ctx: AppContext,
): Promise<DeleteCard> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  return await io.query<DeleteCard, { tokenId: string }>({
    query: mutation,
    variables: { tokenId: id },
  }, { headers: { cookie } });
}

export const defaultVisibility = "private";
export default loader;
