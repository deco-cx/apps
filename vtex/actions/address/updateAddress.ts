import { PostalAddressVTEX } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Address {
  name?: string;
  addressName?: string;
  addressType?: string;
  city?: string;
  complement: string | null;
  country?: string;
  geoCoordinates?: number[];
  neighborhood?: string;
  number?: string;
  postalCode?: string;
  receiverName: string | null;
  reference?: string;
  state?: string;
  street?: string;
  addressId: string;
}

async function action(
  props: Address,
  req: Request,
  ctx: AppContext,
): Promise<
  | PostalAddressVTEX
  | null
> {
  const { io } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);
  const { addressId, ...addressFields } = props;

  const mutation = `
    mutation UpdateAddress($addressId: String!, $addressFields: AddressInput) {
      updateAddress(id: $addressId, fields: $addressFields)
        @context(provider: "vtex.store-graphql") {
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
    }
  `;

  try {
    const { updateAddress: updatedAddress } = await io.query<
      { updateAddress: Address },
      { addressId: string; addressFields: Omit<Address, "addressId"> }
    >(
      {
        query: mutation,
        operationName: "UpdateAddress",
        variables: {
          addressId,
          addressFields,
        },
      },
      { headers: { cookie } },
    );

    return {
      "@type": "PostalAddress",
      addressCountry: updatedAddress?.country,
      addressLocality: updatedAddress?.city,
      addressRegion: updatedAddress?.state,
      postalCode: updatedAddress?.postalCode,
      streetAddress: updatedAddress?.street,
      receiverName: updatedAddress?.receiverName,
      complement: updatedAddress?.complement,
      addressId: updatedAddress?.addressId,
    };
  } catch (error) {
    console.error("Error updating address:", error);
    return null;
  }
}
export default action;
