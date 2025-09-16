import { PostalAddress } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @description User country code. Ex: USA
   */
  countryCode: string;
  /**
   * @description User postal code.
   */
  postalCode: string;
}

/**
 * @title Get Address by Postal Code
 * @description Get an address by postal code
 */
export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PostalAddress> {
  const { countryCode, postalCode } = props;
  const { vcs } = ctx;

  const addressByPostalCode = await vcs
    ["GET /api/checkout/pub/postal-code/:countryCode/:postalCode"]({
      countryCode,
      postalCode,
    })
    .then((r) => r.json());

  return {
    "@type": "PostalAddress",
    postalCode: addressByPostalCode.postalCode,
    addressLocality: addressByPostalCode.city,
    addressRegion: addressByPostalCode.state,
    addressCountry: addressByPostalCode.country,
    streetAddress: addressByPostalCode.street || undefined,
    identifier: addressByPostalCode.number || undefined,
    areaServed: addressByPostalCode.neighborhood || undefined,
    description: addressByPostalCode.complement || undefined,
    disambiguatingDescription: addressByPostalCode.reference || undefined,
    latitude: addressByPostalCode.geoCoordinates?.[0] || undefined,
    longitude: addressByPostalCode.geoCoordinates?.[1] || undefined,
  };
}
