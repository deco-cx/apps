import type { AppContext } from "../../mod.ts";
import { SendPasswordResetEmail } from "../../utils/storefront/queries.ts";
import {
  MutationCustomerRecoverArgs,
  CustomerRecoverPayload,
} from "../../utils/storefront/storefront.graphql.gen.ts";

interface Props {
  email: string;
}

/**
 * @title Shopify Integration
 * @description Send Password Reset Email
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CustomerRecoverPayload> => {
  const { storefront } = ctx;

  const data = await storefront.query<
    CustomerRecoverPayload,
    MutationCustomerRecoverArgs
  >({
    variables: props,
    ...SendPasswordResetEmail,
  });

  return data;
};

export default action;
