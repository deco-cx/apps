import type { PostalAddress } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { toPostalAddress } from "../../utils/transform.ts";
import { Address } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

const mutation =
  `mutation UpdateAddress($addressId: String!, $addressFields: AddressInput) {
  updateAddress(id: $addressId, fields: $addressFields) @context(provider: "vtex.store-graphql") {
    cacheId
    addresses: address {
      addressId: id
      addressType
      addressName
      city
      complement
      country
      neighborhood
      number
      postalCode
      geoCoordinates
      receiverName
      reference
      state
      street
    }
  }
}`;

interface Props {
  /**
   * Address ID.
   */
  addressId: string;
  /**
   * Address name.
   */
  addressName?: string;
  /**
   * Type of address. For example, Residential or Pickup, among others.
   */
  addressType?: string;
  /**
   * Name of the person who is going to receive the order.
   */
  receiverName?: string;
  /**
   * City of the shipping address.
   */
  city?: string;
  /**
   * State of the shipping address.
   */
  state?: string;
  /**
   * Three letter ISO code of the country of the shipping address.
   */
  country?: string;
  /**
   * Postal Code.
   */
  postalCode?: string;
  /**
   * Street of the address.
   */
  street?: string;
  /**
   * Number of the building, house or apartment in the shipping address.
   */
  number?: string;
  /**
   * Neighborhood of the address.
   */
  neighborhood?: string;
  /**
   * Complement to the shipping address in case it applies.
   */
  complement?: string;
  /**
   * Complement that might help locate the shipping address more precisely in case of delivery.
   */
  reference?: string;
  /**
   * Latitude and longitude of the shipping address.
   */
  geoCoordinates?: number[];
}

/**
 * @title Update Address
 * @description Update an address
 */
async function action(
  { addressId, ...props }: Props,
  req: Request,
  ctx: AppContext,
): Promise<PostalAddress> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  const { updateAddress: updatedAddress } = await io.query<
    { updateAddress: Address },
    { addressId: string; addressFields: Omit<Address, "addressId"> }
  >(
    {
      query: mutation,
      operationName: "UpdateAddress",
      variables: {
        addressId,
        addressFields: {
          ...props,
          receiverName: props.receiverName || null,
          complement: props.complement || null,
        },
      },
    },
    { headers: { cookie } },
  );

  return toPostalAddress(updatedAddress);
}

export const defaultVisibility = "private";
export default action;
