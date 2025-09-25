import { PostalAddress } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { toPostalAddress } from "../../utils/transform.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface AddressInput {
  name?: string;
  addressName: string;
  addressType?: string;
  city?: string;
  complement?: string;
  country?: string;
  geoCoordinates?: number[];
  neighborhood?: string;
  number?: string;
  postalCode?: string;
  receiverName?: string;
  reference?: string;
  state?: string;
  street?: string;
}

interface SavedAddress extends AddressInput {
  id: string;
  cacheId: string;
}

interface Props {
  /**
   * Address name.
   */
  addressName: string;
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
   * Geo coordinates of the address.
   */
  geoCoordinates?: number[];
}

const mutation = `mutation SaveAddress($address: AddressInput!) {
  saveAddress(address: $address) @context(provider: "vtex.store-graphql") {
    addressId
    cacheId
    id
    userId
    receiverName
    complement
    neighborhood
    country
    state
    number
    street
    geoCoordinates
    postalCode
    city
    name
    addressName
    addressType
  }
}`;

/**
 * @title Create Address
 * @description Create a new address
 */
async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<PostalAddress> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  const { saveAddress: savedAddress } = await io.query<
    { saveAddress: SavedAddress },
    { address: AddressInput }
  >(
    {
      query: mutation,
      operationName: "SaveAddress",
      variables: {
        address: props,
      },
    },
    { headers: { cookie } },
  );

  return toPostalAddress({
    ...savedAddress,
    addressId: savedAddress.id || "",
    complement: savedAddress.complement || null,
    receiverName: savedAddress.receiverName || null,
  });
}

export const defaultVisibility = "private";
export default action;
