import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface DeleteAddress {
  cacheId: string;
  addresses: {
    addressId: string;
    addressType: string | null;
    addressName: string;
    city: string | null;
    complement: string | null;
    country: string | null;
    neighborhood: string | null;
    number: string | null;
    postalCode: string | null;
    geoCoordinates: number[] | null;
    receiverName: string | null;
    reference: string | null;
    state: string | null;
    street: string | null;
  }[];
}

const mutation = `mutation DeleteAddress($addressId: String) {
  deleteAddress(id: $addressId) {
    cacheId
    addresses {
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
  addressId: string;
}

/**
 * @title Delete Address
 * @description Delete an address
 */
async function action({ addressId }: Props, req: Request, ctx: AppContext) {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  return await io.query<DeleteAddress, { addressId: string }>(
    {
      query: mutation,
      operationName: "DeleteAddress",
      variables: { addressId },
    },
    { headers: { cookie } },
  );
}

export const defaultVisibility = "private";
export default action;
