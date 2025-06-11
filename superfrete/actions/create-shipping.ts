import type { AppContext } from "../mod.ts";
import type { Order, ShippingRequest } from "../client.ts";

interface Props {
  /**
   * @title ID do Servico
   * @description ID do serviço de entrega (1: PAC, 2: Sedex, 17: Mini Envios)
   */
  service: number;

  /**
   * @title Remetente
   * @description Informações do remetente
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
   * @title Destinatario
   * @description Informações do destinatário
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
   * @title Produtos
   * @description Lista de produtos a serem enviados
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
   * @description Informações dos volumes/pacotes
   */
  volumes: Array<{
    weight: number;
    height: number;
    width: number;
    length: number;
  }>;

  /**
   * @title Opcoes
   * @description Opções adicionais do frete
   */
  options?: {
    own_hand?: boolean;
    receipt?: boolean;
    insurance_value?: number;
    use_insurance_value?: boolean;
  };
}

/**
 * @name Criar Frete
 * @title Criar Frete
 * @description Envia um frete para a SuperFrete
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
