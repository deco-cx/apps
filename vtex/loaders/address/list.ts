import { Address } from "../../utils/types.ts";
import { PostalAddress } from "../../../commerce/types.ts";
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
  PostalAddress[] & { receiverName?: string; addressName?: string } | null
> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const query = `query getUserAddresses {
      profile {
        addresses {
          city
          country
          postalCode
          state
          street
          receiverName
          addressName
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
    }));
  } catch (_) {
    return null;
  }
}

export default loader;
