import { AppContext } from "../../mod.ts";

export interface Fretes {
  fretes: Array<{
    id: string;
    tipo: string;
    label: string;
    valor: number;
    prazo: string;
    entregaAgendada: boolean;
  }>;
  restricaoEntrega: string;
  mensagem: string;
}

export interface Props {
  cep: string;
  idProduto: number;
  idAtributoValor: number;
  quantidade: number;
  marketplace?: boolean;
  idMarketplaceSeller?: number;
}

/**
 * @title Wap Integration
 * @description Shipment Simulation Action
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Fretes | null> => {
  const { api } = ctx;

  const response = await api
    ["POST /api/v2/front/shipment/product"]({}, {
      headers: req.headers,
      body: props,
    });

  return response.json() as Promise<Fretes>;
};

export default loader;
