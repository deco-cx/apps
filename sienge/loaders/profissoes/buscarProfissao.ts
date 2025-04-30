import { AppContext } from "../../mod.ts";
import {
  createProfessionsClient,
  Profession,
} from "../../clients/professions.ts";

export interface Props {
  /**
   * @title ID da Profissão
   * @description ID único da profissão no Sienge
   */
  id: number;
}

/**
 * @title Buscar Profissão
 * @description Retorna os detalhes de uma profissão específica
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Profession | null> => {
  const professionsClient = createProfessionsClient(ctx);

  try {
    const response = await professionsClient["GET /professions/:id"]({
      id: props.id,
    });

    const data = await response.json();

    // Retorna o primeiro item da lista de resultados (deve haver apenas um)
    return data.results[0] || null;
  } catch (error) {
    console.error("Erro ao buscar profissão:", error);
    return null;
  }
};

export default loader;
