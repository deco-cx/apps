import { Person } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import { FetchCustomerInfo } from "../utils/storefront/queries.ts";
import { Customer } from "../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie } from "../utils/user.ts";

/**
 * @title Shopify Integration
 * @description User loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> => {
  const { storefront } = ctx;

  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) return null;

  try {
    const customer = await storefront.query<
      { customer: Customer },
      { customerAccessToken: string }
    >({
      variables: { customerAccessToken },
      ...FetchCustomerInfo,
    }).then((data) => data.customer);

    if (!customer) return null;

    return {
      "@id": customer.id,
      email: customer.email ?? "",
      givenName: customer.firstName ?? "",
      familyName: customer.lastName ?? "",
    };
  } catch {
    return null;
  }
};

export default loader;
