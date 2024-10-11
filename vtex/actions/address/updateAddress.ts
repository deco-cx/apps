import { PostalAddress } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Address {
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

interface AddressInput {
  receiverName?: string;
  complement?: string | null;
  neighborhood?: string | null;
  country?: string;
  state?: string;
  number?: string | null;
  street?: string;
  geoCoordinates?: number[];
  postalCode?: string;
  city?: string;
  reference?: string | null;
  addressName: string;
  addressType?: string;
}

async function loader(
  props: Address,
  req: Request,
  ctx: AppContext,
): Promise<
  | PostalAddress & { receiverName?: string | null; complement?: string | null }
  | null
> {
  const { io } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);
  const id = props.addressName;

  const mutation = `
    mutation UpdateAddress($addressId: String, $addressFields: AddressInput) {
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
      }`;

  try {
    const { updateAddress: updatedAddress } = await io.query<
      { updateAddress: Address },
      { addressId: string; addressFields: AddressInput }
    >(
      {
        query: mutation,
        operationName: "UpdateAddress",
        variables: {
          addressId: id,
          addressFields: props,
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
    };
  } catch (error) {
    console.error("Error updating address:", error);
    return null;
  }
}

export default loader;
