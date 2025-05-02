import { AppContext } from "../../mod.ts";
import { createUnitsClient, UnitInsert } from "../../clients/units.ts";

export interface Props {
  /**
   * @title Nome da Unidade
   * @description Nome/Identificador da unidade
   */
  name: string;

  /**
   * @title ID do Empreendimento
   * @description Código do empreendimento ao qual a unidade pertence
   */
  enterpriseId: number;

  /**
   * @title ID do Tipo de Produto
   * @description Código do tipo de produto
   */
  productTypeId?: number;

  /**
   * @title Matrícula
   * @description Número da matrícula do imóvel
   */
  propertyEnrollment?: string;

  /**
   * @title Dígito da Matrícula
   * @description Dígito da matrícula do imóvel
   */
  propertyEnrollmentDigit?: string;

  /**
   * @title CNS do Cartório
   * @description Código nacional do cartório
   */
  nationalRegistryOffice?: string;

  /**
   * @title Número do Registro
   * @description Número do registro de averbação
   */
  recordEnrollmentNumber?: string;

  /**
   * @title Data do Registro
   * @description Data do registro de averbação (formato yyyy-MM-dd)
   */
  recordEnrollmentDate?: string;

  /**
   * @title ID da Situação
   * @description Código da situação da unidade
   */
  situationId?: number;

  /**
   * @title Estoque Comercial
   * @description Estoque comercial da unidade
   * @enum ["D", "R", "E", "M", "T", "G"]
   */
  commercialStock?: string;

  /**
   * @title Área Total
   * @description Área total de construção em m²
   */
  buildingArea?: number;

  /**
   * @title Área Privativa
   * @description Área privativa da unidade em m²
   */
  privateArea?: number;

  /**
   * @title Área do Terreno
   * @description Área do terreno em m²
   */
  landArea?: number;

  /**
   * @title Área Comum
   * @description Área comum da unidade em m²
   */
  commonArea?: number;

  /**
   * @title Área do Terraço
   * @description Área do terraço em m²
   */
  terraceArea?: number;

  /**
   * @title Fração Ideal
   * @description Fração ideal da unidade
   */
  occupancy?: number;

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
   * @title ID da Unidade Pai
   * @description Código da unidade pai (para unidades filhas)
   */
  parentUnitId?: number;
}

/**
 * @title Adicionar Unidade
 * @description Cadastra uma nova unidade imobiliária no Sienge
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  const unitsClient = createUnitsClient(ctx);

  try {
    const unitInsert: UnitInsert = {
      name: props.name,
      enterpriseId: props.enterpriseId,
      productTypeId: props.productTypeId,
      propertyEnrollment: props.propertyEnrollment,
      propertyEnrollmentDigit: props.propertyEnrollmentDigit,
      nationalRegistryOffice: props.nationalRegistryOffice,
      recordEnrollmentNumber: props.recordEnrollmentNumber,
      recordEnrollmentDate: props.recordEnrollmentDate,
      situationId: props.situationId,
      commercialStock: props.commercialStock,
      buildingArea: props.buildingArea,
      privateArea: props.privateArea,
      landArea: props.landArea,
      commonArea: props.commonArea,
      terraceArea: props.terraceArea,
      occupancy: props.occupancy,
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
      parentUnitId: props.parentUnitId,
    };

    await unitsClient["POST /units"](
      {},
      { body: unitInsert },
    );

    return {
      success: true,
      message: "Unidade cadastrada com sucesso.",
    };
  } catch (error: unknown) {
    console.error("Erro ao cadastrar unidade:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: `Erro ao cadastrar unidade: ${errorMessage}`,
    };
  }
};

export default action;
