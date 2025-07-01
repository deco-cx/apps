import type { AppContext } from "../mod.ts";
import type {
  FreightQuoteRequest,
  FreightQuoteResponse,
  Package,
  Product,
} from "../client.ts";

interface Props {
  /**
   * @title From Postal Code
   * @description Origin postal code (format XXXXX-XXX or XXXXXXXX)
   */
  fromPostalCode: string;

  /**
   * @title To Postal Code
   * @description Destination postal code (format XXXXX-XXX or XXXXXXXX)
   */
  toPostalCode: string;

  /**
   * @title Services
   * @description Delivery service codes (1: PAC, 2: Sedex, 17: Mini Envios)
   * @default "1,2"
   */
  services?: string;

  /**
   * @title Own Hand
   * @description Indicates if Own Hand service should be considered
   * @default false
   */
  ownHand?: boolean;

  /**
   * @title Receipt Notification
   * @description Indicates if Receipt Notification service should be considered
   * @default false
   */
  receipt?: boolean;

  /**
   * @title Insurance Value
   * @description Declared value of the package for insurance calculation
   */
  insuranceValue?: number;

  /**
   * @title Use Insurance
   * @description Indicates if insurance should be included in freight calculation
   * @default false
   */
  useInsuranceValue?: boolean;

  /**
   * @title Package Dimensions
   * @description Box dimensions (when already known). If not provided, use individual products
   */
  package?: Package;

  /**
   * @title Quantity of Products
   * @description Quantity of products (when already known). If not provided, use individual products
   */
  quantity?: number;

  /**
   * @title Individual Products
   * @description List of individual products (API will calculate ideal box)
   */
  products?: Product[];
}

/**
 * @name Calculate Freight Quote
 * @title Calculate Freight Quote
 * @description Calculates freight value for a package based on postal codes and product characteristics
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<FreightQuoteResponse> => {
  const {
    fromPostalCode,
    toPostalCode,
    services = "1,2,17",
    ownHand = false,
    receipt = false,
    insuranceValue = 0,
    useInsuranceValue = false,
    package: packageDimensions,
    quantity,
    products,
  } = props;

  // Validação: deve ter ou package ou products
  if (!packageDimensions && (!products || products.length === 0)) {
    throw new Error(
      "Deve ser informado ou as dimensões da caixa ou a lista de produtos",
    );
  }

  const requestData: FreightQuoteRequest = {
    from: {
      postal_code: fromPostalCode.replace(/\D/g, ""),
    },
    to: {
      postal_code: toPostalCode.replace(/\D/g, ""),
    },
    services,
    options: {
      own_hand: ownHand,
      receipt,
      insurance_value: insuranceValue,
      use_insurance_value: useInsuranceValue,
    },
  };

  // Adiciona package ou products conforme disponível
  if (packageDimensions) {
    requestData.package = packageDimensions;
    requestData.products = [{
      quantity,
      weight: packageDimensions.weight,
      height: packageDimensions.height,
      width: packageDimensions.width,
      length: packageDimensions.length,
    }];
  } else if (products) {
    requestData.products = products;
  }

  const response = await ctx.api["POST /api/v0/calculator"](
    {},
    {
      body: requestData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro ao calcular frete: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();

  // @ts-ignore - It's bad, but leave it like that for now.
  return result.map((service) => {
    if (service.error === "444") {
      delete service.error;
      service.disponible = false;
    } else if (service.error === undefined) {
      service.disponible = true;
    }

    return service;
  });
};

export default loader;
