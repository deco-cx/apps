import { AppContext } from "../mod.ts";
import { REGISTROBR } from "../client.ts";

interface Props {
  /**
   * @title Domínio
   * @description Nome do domínio a ser verificado (sem o .br)
   */
  domain: string;
}

/**
 * @title Verificar domínio .br
 * @description Verifica disponibilidade e informações de um domínio .br
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<REGISTROBR> => {
  const { domain } = props;

  // Certifica-se de que o domínio está no formato correto
  let domainName = domain;
  if (domainName.includes(".br")) {
    // Se o usuário incluiu .br, mantém como está
    domainName = domain;
  } else {
    // Caso contrário, adiciona .com.br como padrão
    domainName = `${domain}.com.br`;
  }

  const response = await ctx.api["GET /registrobr/v1/:domain"]({
    domain: domainName,
  });

  if (!response.ok) {
    throw new Error(`Erro ao verificar domínio: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};

export default loader;
