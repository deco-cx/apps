import { AppContext } from "../../mod.ts";
import { createUnitsClient, UnitUpdate } from "../../clients/units.ts";

export interface Props {
  /**
   * @title ID da Unidade
   * @description Código identificador da unidade imobiliária no Sienge
   */
  unitId: number;

  /**
   * @title Estoque Comercial
   * @description Estoque comercial da unidade
   * @enum ["D", "R", "E", "M", "T", "G"]
   */
  commercialStock?: string;

  /**
   * @title Complacência com Brinde
   * @description Indica se possui complacência com brinde
   */
  prizedCompliance?: boolean;

  /**
   * @title Logradouro
   * @description Nome da rua/avenida do endereço
   */
  addressStreetName?: string;

  /**
   * @title Número
   * @description Número do endereço
   */
  addressNumber?: string;

  /**
   * @title Complemento
   * @description Complemento do endereço
   */
  addressComplement?: string;

  /**
   * @title Bairro
   * @description Bairro do endereço
   */
  addressNeighborhood?: string;

  /**
   * @title CEP
   * @description Código postal do endereço
   */
  addressZipCode?: string;

  /**
   * @title ID da Cidade
   * @description Código da cidade no Sienge
   */
  addressCityId?: number;

  /**
   * @title UF
   * @description Sigla do estado
   */
  addressStateCode?: string;

  /**
   * @title Nome do Bloco
   * @description Nome do bloco onde está a unidade
   */
  blockName?: string;

  /**
   * @title Número do Bloco
   * @description Número do bloco onde está a unidade
   */
  blockNumber?: string;

  /**
   * @title Lote
   * @description Número do lote
   */
  lot?: string;

  /**
   * @title Posição
   * @description Posição da unidade no empreendimento
   */
  position?: string;

  /**
   * @title Vaga de Garagem
   * @description Descrição da vaga de garagem
   */
  parking?: string;

  /**
   * @title Valor de Venda
   * @description Valor de venda da unidade
   */
  saleValue?: number;

  /**
   * @title Link da Planta
   * @description Link para documento da planta da unidade
   */
  unitPlanDocumentLink?: string;

  /**
   * @title Informações Adicionais
   * @description Informações adicionais sobre a unidade
   */
  additionalInformation?: string;

  /**
   * @title Localização no Andar
   * @description Descrição da localização da unidade no andar
   */
  floorLocation?: string;

  /**
   * @title ID da Situação
   * @description Código da situação da unidade
   */
  situationId?: number;
}

/**
 * @title Atualizar Unidade
 * @description Atualiza os dados de uma unidade imobiliária
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const unitsClient = createUnitsClient(ctx);

  try {
    const unitUpdate: UnitUpdate = {
      commercialStock: props.commercialStock,
      prizedCompliance: props.prizedCompliance,
      addressStreetName: props.addressStreetName,
      addressNumber: props.addressNumber,
      addressComplement: props.addressComplement,
      addressNeighborhood: props.addressNeighborhood,
      addressZipCode: props.addressZipCode,
      addressCityId: props.addressCityId,
      addressStateCode: props.addressStateCode,
      blockName: props.blockName,
      blockNumber: props.blockNumber,
      lot: props.lot,
      position: props.position,
      parking: props.parking,
      saleValue: props.saleValue,
      unitPlanDocumentLink: props.unitPlanDocumentLink,
      additionalInformation: props.additionalInformation,
      floorLocation: props.floorLocation,
      situationId: props.situationId,
    };

    await unitsClient["PATCH /units/:unitId"](
      { unitId: props.unitId },
      { body: unitUpdate },
    );

    return {
      success: true,
      message: "Unidade atualizada com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao atualizar unidade:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao atualizar unidade: ${errorMessage}`,
    };
  }
};

export default action;
