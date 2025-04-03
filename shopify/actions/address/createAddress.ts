import type { AppContext } from "../../mod.ts";
import { CreateAddress } from "../../utils/storefront/queries.ts";
import {
  MutationCustomerAddressCreateArgs,
  CustomerAddressCreatePayload,
} from "../../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie } from "../../utils/user.ts";

interface Props {
  address: string;
  country: string;
  provice: string;
  city: string;
  zip: string;
}

/**
 * @title Shopify Integration
 * @description Create Address
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CustomerAddressCreatePayload | null> => {
  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) return null;

  const { storefront } = ctx;

  const data = await storefront.query<
    CustomerAddressCreatePayload,
    MutationCustomerAddressCreateArgs
  >({
    variables: {
        customerAccessToken,
        address: {
            address1: props.address,
            ...props
        }
    },
    ...CreateAddress,
  });

  return data;
};

export default action;
