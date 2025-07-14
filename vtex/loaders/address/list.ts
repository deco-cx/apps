import { Address } from "../../utils/types.ts";
import { PostalAddressVTEX } from "../../../commerce/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";
import { AppContext } from "../../mod.ts";

export interface User {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  gender?: string;
  document?: string;
  homePhone?: string;
  birthDate?: string;
  corporateDocument?: string;
  corporateName?: string;
  tradeName?: string;
  businessPhone?: string;
  isCorporate?: boolean;
  customFields?: { key: string; value: string }[];
}

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<
  PostalAddressVTEX[] | null
> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const query = `query Addresses @context(scope: "private") {
    profile {
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
        state
        street
      }
    }
  }`;

  try {
    const { profile } = await io.query<
      { profile: { addresses: Address[] } },
      null
    >(
      { query },
      { headers: { cookie } },
    );

    return profile?.addresses?.map((address) => ({
      "@type": "PostalAddress",
      addressCountry: address?.country,
      addressLocality: address?.city,
      addressRegion: address?.state,
      postalCode: address?.postalCode,
      streetAddress: address?.street,
      receiverName: address?.receiverName,
      addressName: address?.addressName,
      complement: address?.complement,
      addressId: address?.addressId,
    }));
  } catch (_) {
    return null;
  }
}

export default loader;
