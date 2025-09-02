import { Person } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import authenticate from "../utils/authenticate.ts";
import { GetUser } from "../utils/graphql/queries.ts";
import {
  GetUserQuery,
  GetUserQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { handleAuthError } from "../utils/authError.ts";

/**
 * @title Wake Integration
 * @description User loader
 */
const userLoader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> => {
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const customerAccessToken = await authenticate(req, ctx);

  if (!customerAccessToken) return null;

  let data: GetUserQuery | undefined;
  try {
    data = await storefront.query<
      GetUserQuery,
      GetUserQueryVariables
    >({
      variables: { customerAccessToken },
      ...GetUser,
    }, {
      headers,
    });
  } catch (error: unknown) {
    handleAuthError(error, "load user data");
  }

  const customer = data?.customer;

  if (!customer) return null;

  return {
    "@id": String(customer.id ?? customer.customerId),
    email: customer.email ?? undefined,
    givenName: customer.customerName ?? undefined,
    gender: customer.gender === "Masculino"
      ? "https://schema.org/Male"
      : customer.gender === "Feminino"
      ? "https://schema.org/Female"
      : undefined,
  };
};

export default userLoader;

// User-specific response; must not be cached/shared.
export const cache = "no-store";
