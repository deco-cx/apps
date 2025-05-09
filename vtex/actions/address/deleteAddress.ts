import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface DeleteAddress {
  addressId: string;
}

interface AddressInput {
  addressId: string;
}

async function action(
  { addressId }: AddressInput,
  req: Request,
  ctx: AppContext,
) {
  const { io } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  const mutation = `
  mutation DeleteAddress($addressId: String) {
    deleteAddress(id: $addressId) {
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

  try {
    return await io.query<DeleteAddress, { addressId: string }>(
      {
        query: mutation,
        operationName: "DeleteAddress",
        variables: { addressId },
      },
      { headers: { cookie } },
    );
  } catch (error) {
    console.error("Error deleting address:", error);
    return null;
  }
}

export default action;
