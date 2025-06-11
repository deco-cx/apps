import type { AppContext } from "../mod.ts";
import type {
  FreightQuoteRequest,
  FreightQuoteResponse,
  Package,
  Product,
} from "../client.ts";

interface Props {
  /**
   * @title CEP de Origem
   * @description CEP de origem da encomenda (formato XXXXX-XXX ou XXXXXXXX)
   */
  fromPostalCode: string;

  /**
   * @title CEP de Destino
   * @description CEP de destino da encomenda (formato XXXXX-XXX ou XXXXXXXX)
   */
  toPostalCode: string;

  /**
   * @title Servicos
   * @description Códigos dos serviços de entrega (1: PAC, 2: Sedex, 17: Mini Envios)
   * @default "1,2"
   */
  services?: string;

  /**
   * @title Mao Propria
   * @description Indica se o serviço de Mão Própria deve ser considerado
   * @default false
   */
  ownHand?: boolean;

  /**
   * @title Aviso de Recebimento
   * @description Indica se o serviço de Aviso de Recebimento deve ser considerado
   * @default false
   */
  receipt?: boolean;

  /**
   * @title Valor do Seguro
   * @description Valor declarado da encomenda para cálculo do seguro
   */
  insuranceValue?: number;

  /**
   * @title Usar Seguro
   * @description Indica se o seguro deve ser incluído no cálculo do frete
   * @default false
   */
  useInsuranceValue?: boolean;

  /**
   * @title Dimensoes da Caixa
   * @description Dimensões da caixa (quando já conhecidas). Se não informado, use produtos individuais
   */
  package?: Package;

  /**
   * @title Produtos Individuais
   * @description Lista de produtos individuais (a API calculará a caixa ideal)
   */
  products?: Product[];
}

/**
 * @name Cotação de Frete
 * @title Cotacao de Frete
 * @description Calcula o valor do frete para uma encomenda baseado em CEPs e características dos produtos
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
  return result;
};

export default loader;
