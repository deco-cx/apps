import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

const mutation =
  `mutation SubscribeNewsletter($email: String!, $isNewsletterOptIn: Boolean!) {
  subscribeNewsletter(email: $email, isNewsletterOptIn: $isNewsletterOptIn) @context(provider: "vtex.store-graphql@2.x")
}`;

interface Props {
  /**
   * If true, the user will be subscribed to the newsletter.
   */
  subscribe: boolean;
}

/**
 * @title Update Newsletter Opt In
 * @description Update the newsletter opt in
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ subscribed: boolean }> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  await io.query<unknown, { email: string; isNewsletterOptIn: boolean }>(
    {
      query: mutation,
      operationName: "SubscribeNewsletter",
      variables: {
        email: payload.sub,
        isNewsletterOptIn: props.subscribe,
      },
    },
    { headers: { cookie } },
  );

  return { subscribed: props.subscribe };
}

export default loader;
