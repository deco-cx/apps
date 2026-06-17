import type { AppContext } from "../../mod.ts";
import { SetDefaultAddress } from "../../utils/storefront/queries.ts";
import {
  MutationCustomerDefaultAddressUpdateArgs,
  CustomerDefaultAddressUpdatePayload,
} from "../../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie } from "../../utils/user.ts";

interface Props {
  addressId: string;
}

/**
 * @title Shopify Integration
 * @description Set Default Address
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CustomerDefaultAddressUpdatePayload | null> => {
  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) return null;

  const { addressId } = props;
  const { storefront } = ctx;

  const data = await storefront.query<
    CustomerDefaultAddressUpdatePayload,
    MutationCustomerDefaultAddressUpdateArgs
  >({
    variables: {
        customerAccessToken,
        addressId
    },
    ...SetDefaultAddress,
  });

  return data;
};

export default action;
