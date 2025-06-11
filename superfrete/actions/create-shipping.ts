import type { AppContext } from "../mod.ts";
import type { Order, ShippingRequest } from "../client.ts";

interface Props {
  /**
   * @title Service ID
   * @description Delivery service ID (1: PAC, 2: Sedex, 17: Mini Envios)
   */
  service: number;

  /**
   * @title Sender
   * @description Sender information
   */
  from: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    state_register?: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    country_id: string;
    postal_code: string;
    note?: string;
  };

  /**
   * @title Recipient
   * @description Recipient information
   */
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    state_register?: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    country_id: string;
    postal_code: string;
    note?: string;
  };

  /**
   * @title Products
   * @description List of products to be shipped
   */
  products: Array<{
    quantity?: number;
    weight: number;
    height: number;
    width: number;
    length: number;
  }>;

  /**
   * @title Volumes
   * @description Volume/package information
   */
  volumes: Array<{
    weight: number;
    height: number;
    width: number;
    length: number;
  }>;

  /**
   * @title Options
   * @description Additional freight options
   */
  options?: {
    own_hand?: boolean;
    receipt?: boolean;
    insurance_value?: number;
    use_insurance_value?: boolean;
  };
}

/**
 * @name Create Shipping
 * @title Create Shipping
 * @description Sends a freight to SuperFrete
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Order> => {
  const { service, from, to, products, volumes, options = {} } = props;

  const requestData: ShippingRequest = {
    service,
    from: {
      ...from,
      postal_code: from.postal_code.replace(/\D/g, ""),
    },
    to: {
      ...to,
      postal_code: to.postal_code.replace(/\D/g, ""),
    },
    products,
    volumes,
    options,
  };

  const response = await ctx.api["POST /api/v0/quote/checkout"](
    {},
    {
      body: requestData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar frete: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result;
};

export default action;
