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

interface AddressByPostalCode {
  postalCode: string;
  city: string;
  state: string;
  country: string;
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  complement: string | null;
  reference: string | null;
  geoCoordinates: number[] | null;
}

export default async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AddressByPostalCode> {
  const { countryCode, postalCode } = props;
  const { vcs } = ctx;

  try {
    const addressByPostalCode = await vcs
      ["GET /api/checkout/pub/postal-code/:countryCode/:postalCode"]({
        countryCode,
        postalCode,
      })
      .then((r) => r.json()) as AddressByPostalCode;

    return addressByPostalCode;
  } catch (error) {
    console.error(error);
    return {
      postalCode: "",
      city: "",
      state: "",
      country: "",
      street: null,
      number: null,
      neighborhood: null,
      complement: null,
      reference: null,
      geoCoordinates: [],
    };
  }
}
