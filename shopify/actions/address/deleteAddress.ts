import type { AppContext } from "../../mod.ts";
import { DeleteAddress } from "../../utils/storefront/queries.ts";
import {
  CustomerAddressDeletePayload,
  MutationCustomerAddressDeleteArgs,
} from "../../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie } from "../../utils/user.ts";

interface Props {
  addressId: string;
}

/**
 * @title Shopify Integration
 * @description Delete Address
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CustomerAddressDeletePayload | null> => {
  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) return null;

  const { addressId } = props;
  const { storefront } = ctx;

  const data = await storefront.query<
    CustomerAddressDeletePayload,
    MutationCustomerAddressDeleteArgs
  >({
    variables: {
      customerAccessToken,
      id: addressId,
    },
    ...DeleteAddress,
  });

  return data;
};

export default action;
