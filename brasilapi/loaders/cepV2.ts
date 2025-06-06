import { AppContext } from "../mod.ts";
import { AddressV2 } from "../client.ts";

interface Props {
  /**
   * @title CEP
   * @description Código de Endereçamento Postal (apenas números)
   */
  cep: string;
}

/**
 * @title Buscar endereço por CEP (com geolocalização)
 * @description Busca informações de endereço a partir de um CEP, incluindo coordenadas geográficas
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AddressV2> => {
  const { cep } = props;

  // Remover caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, "");

  const response = await ctx.api["GET /cep/v2/:cep"]({
    cep: cleanCep,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar CEP: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
