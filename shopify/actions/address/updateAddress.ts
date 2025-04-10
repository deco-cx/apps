import type { AppContext } from "../../mod.ts";
import { UpdateAddress } from "../../utils/storefront/queries.ts";
import {
  CustomerAddressUpdatePayload,
  MutationCustomerAddressUpdateArgs,
} from "../../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie } from "../../utils/user.ts";

interface Props {
  addressId: string;
  address: string;
  country: string;
  province: string;
  city: string;
  zip: string;
}

/**
 * @title Shopify Integration
 * @description Update Address
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<CustomerAddressUpdatePayload | null> => {
  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) return null;

  const {
    addressId,
    address: address1,
    country,
    province,
    city,
    zip,
  } = props;
  const { storefront } = ctx;

  const data = await storefront.query<
    CustomerAddressUpdatePayload,
    MutationCustomerAddressUpdateArgs
  >({
    variables: {
      id: addressId,
      customerAccessToken,
      address: {
        address1,
        country,
        province,
        city,
        zip,
      },
    },
    ...UpdateAddress,
  });

  return data;
};

export default action;
