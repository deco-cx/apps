import { PostalAddress } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Address {
    name?: string;
    addressName?: string;
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
    addressId?: string;
    name?: string;
    addressName?: string;
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

async function loader(
    _props: unknown,
    req: Request,
    ctx: AppContext,
): Promise<PostalAddress | null> {
    const { io } = ctx;
    const { cookie } = parseCookie(req.headers, ctx.account);

    const moc: AddressInput = {
        addressType: "Residential",
        addressName: "Home Address",
        city: "Los Angeles",
        complement: "Apt 4B",
        country: "USA",
        neighborhood: "Downtown",
        number: "1234",
        postalCode: "90001",
        geoCoordinates: [-111.98, 40.74],
        receiverName: "John Maria",
        reference: "Near the central park",
        state: "UTA",
        street: "Main St",
    };

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
                    addressId: "9y11rmhpsq",
                    addressFields: {
                        ...moc,
                    },
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
        };
    } catch (error) {
        console.error("Error updating address:", error);
        return null;
    }
}

export default loader;
