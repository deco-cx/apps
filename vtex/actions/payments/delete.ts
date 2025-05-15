import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

export interface DeleteCard {
  deletePaymentToken: boolean;
}

interface Props {
  id: string;
}

async function loader(
  { id }: Props,
  req: Request,
  ctx: AppContext,
): Promise<DeleteCard | null> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const mutation = `mutation DeleteCreditCardToken($tokenId: ID!) {
    deletePaymentToken(tokenId: $tokenId) @context(provider: "vtex.my-cards-graphql@2.x")
  }`;

  try {
    return await io.query<DeleteCard, { tokenId: string }>({
      query: mutation,
      variables: { tokenId: id },
    }, { headers: { cookie } });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default loader;
