import { AppContext } from "../../mod.ts";
import {
  createPropertyTypesClient,
  PropertyType,
} from "../../clients/propertyTypes.ts";

export interface Props {
  /**
   * @title ID do Tipo de Imóvel
   * @description ID único do tipo de imóvel no Sienge
   */
  id: number;
}

/**
 * @title Buscar Tipo de Imóvel
 * @description Retorna os detalhes de um tipo de imóvel específico
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<PropertyType | null> => {
  const propertyTypesClient = createPropertyTypesClient(ctx);

  try {
    const response = await propertyTypesClient["GET /property-types/:id"]({
      id: props.id,
    });

    const data = await response.json();

    // Retorna o primeiro item da lista de resultados (deve haver apenas um)
    return data.results[0] || null;
  } catch (error) {
    console.error("Erro ao buscar tipo de imóvel:", error);
    return null;
  }
};

export default loader;
