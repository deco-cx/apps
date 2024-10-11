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
    | PostalAddress & {
        receiverName?: string | null;
        complement?: string | null;
    }
    | null
> {
    const { io } = ctx;
    const { cookie } = parseCookie(req.headers, ctx.account);

    const mutation = `
  mutation SaveAddress($address: AddressInput!) {
    saveAddress(address: $address) @context(provider: "vtex.store-graphql") {
      id
      cacheId
    }
  }`;

    try {
        const { saveAddress: updatedAddress } = await io.query<
            { saveAddress: Address },
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
        console.error("Error saving address:", error);
        return null;
    }
}

export default loader;
