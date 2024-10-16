import type { AppContext } from "../../mod.ts";
import { SignInWithEmailAndPassword } from "../../utils/storefront/queries.ts";
import {
  CustomerAccessTokenCreateInput,
  CustomerAccessTokenCreateWithMultipassPayload,
} from "../../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie, setUserCookie } from "../../utils/user.ts";

interface Props {
  email: string;
  /**
   * @format password
   */
  password: string;
}

interface AccessTokenResponse {
  customerAccessTokenCreate: CustomerAccessTokenCreateWithMultipassPayload;
}

/**
 * @title Shopify Integration
 * @description Sign In With Email And Password Action
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AccessTokenResponse | null> => {
  const { storefront } = ctx;

  const customerAccessToken = getUserCookie(req.headers);

  if (customerAccessToken) return null;

  const { email, password } = props;

  try {
    const data = await storefront.query<
      {
        customerAccessTokenCreate:
          CustomerAccessTokenCreateWithMultipassPayload;
      },
      CustomerAccessTokenCreateInput
    >({
      variables: { email, password },
      ...SignInWithEmailAndPassword,
    });

    if (!data.customerAccessTokenCreate.customerAccessToken) return data;

    setUserCookie(
      ctx.response.headers,
      data.customerAccessTokenCreate.customerAccessToken.accessToken,
    );

    return data;
  } catch {
    return null;
  }
};

export default action;
