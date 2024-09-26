import { AppContext } from "../../mod.ts";
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

interface SavedAddress {
  id: string;
  cacheId: string;
}

async function action(
  props: AddressInput,
  req: Request,
  ctx: AppContext,
): Promise<
  | SavedAddress
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

    return savedAddress;
  } catch (error) {
    console.error("Error saving address:", error);
    return null;
  }
}

export default action;
