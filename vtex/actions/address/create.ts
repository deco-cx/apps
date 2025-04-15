import { PostalAddress } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";

interface Props {
  /**
   * Address name.
   */
  addressName: string | null;
  /**
   * Type of address. For example, Residential or Pickup, among others.
   */
  addressType: string | null;
  /**
   * Name of the person who is going to receive the order.
   */
  receiverName: string | null;
  /**
   * City of the shipping address.
   */
  city: string | null;
  /**
   * State of the shipping address.
   */
  state: string | null;
  /**
   * Three letter ISO code of the country of the shipping address.
   */
  country: string | null;
  /**
   * Postal Code.
   */
  postalCode: string | null;
  /**
   * Street of the address.
   */
  street: string | null;
  /**
   * Number of the building, house or apartment in the shipping address.
   */
  number: string | null;
  /**
   * Neighborhood of the address.
   */
  neighborhood: string | null;
  /**
   * Complement to the shipping address in case it applies.
   */
  complement: string | null;
  /**
   * Complement that might help locate the shipping address more precisely in case of delivery.
   */
  reference: string | null;
}

async function action(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<PostalAddress> {
  const { vcs } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  const { Id } = await vcs["POST /api/dataentities/:acronym/documents"]({
    acronym: "AD",
  }, {
    body: { ...props, userId: payload.userId } as unknown as Record<
      string,
      unknown
    >,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      cookie,
    },
  }).then((res) => res.json());

  return {
    "@type": "PostalAddress",
    "@id": Id,
    name: props.addressName ?? undefined,
    additionalType: props.addressType ?? undefined,
    alternateName: props.receiverName ?? undefined,
    addressLocality: props.city ?? undefined,
    addressRegion: props.state ?? undefined,
    addressCountry: props.country ?? undefined,
    postalCode: props.postalCode ?? undefined,
    streetAddress: props.street ?? undefined,
    description: props.complement ?? undefined,
    disambiguatingDescription: props.reference ?? undefined,
  };
}

export const defaultVisibility = "private";
export default action;
