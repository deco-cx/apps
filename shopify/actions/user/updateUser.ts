import type { AppContext } from "../../mod.ts";
import { UpdateCustomerInfo } from "../../utils/storefront/queries.ts";
import {
  CustomerUpdatePayload,
  MutationCustomerUpdateArgs,
} from "../../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie } from "../../utils/user.ts";

interface Props {
    email: string;
    firstName: string;
    lastName: string;
    acceptsMarketing?: boolean;
}

/**
 * @title Shopify Integration
 * @description Update Customer Info
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CustomerUpdatePayload | null> => {
  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) return null;

  const { storefront } = ctx;

  const data = await storefront.query<
    CustomerUpdatePayload,
    MutationCustomerUpdateArgs
  >({
    variables: {
        customerAccessToken,
        customer: { ...props }
    },
    ...UpdateCustomerInfo,
  });

  return data;
};

export default action;
