import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

export interface Unit {
  id: number;
  name: string;
  enterpriseId: number;
  enterpriseName?: string;
  productTypeId?: number;
  productTypeName?: string;
  propertyEnrollment?: string;
  propertyEnrollmentDigit?: string;
  nationalRegistryOffice?: string;
  recordEnrollmentNumber?: string;
  recordEnrollmentDate?: string;
  situation?: number;
  situationDescription?: string;
  commercialStock?: string;
  buildingArea?: number;
  privateArea?: number;
  landArea?: number;
  commonArea?: number;
  terraceArea?: number;
  occupancy?: number;
  prizedCompliance?: boolean;
  addressStreetName?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressZipCode?: string;
  addressCityId?: number;
  addressCityName?: string;
  addressStateCode?: string;
  blockName?: string;
  blockNumber?: string;
  lot?: string;
  position?: string;
  parking?: string;
  saleValue?: number;
  unitPlanDocumentLink?: string;
  additionalInformation?: string;
  floorLocation?: string;
  parentUnitId?: number;
  parentUnitName?: string;
  childUnits?: ChildUnit[];
  characteristics?: UnitCharacteristic[];
  groupings?: UnitGrouping[];
  specialValues?: UnitSpecialValue[];
}

export interface ChildUnit {
  id: number;
  name: string;
}

export interface UnitCharacteristic {
  id: number;
  quantity: number;
}

export interface UnitGrouping {
  id: number;
  name?: string;
  value?: string;
}

export interface UnitSpecialValue {
  id: number;
  name?: string;
  value?: number;
}

export interface UnitInsert {
  name: string;
  enterpriseId: number;
  productTypeId?: number;
  propertyEnrollment?: string;
  propertyEnrollmentDigit?: string;
  nationalRegistryOffice?: string;
  recordEnrollmentNumber?: string;
  recordEnrollmentDate?: string;
  situationId?: number;
  commercialStock?: string;
  buildingArea?: number;
  privateArea?: number;
  landArea?: number;
  commonArea?: number;
  terraceArea?: number;
  occupancy?: number;
  prizedCompliance?: boolean;
  addressStreetName?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressZipCode?: string;
  addressCityId?: number;
  addressStateCode?: string;
  blockName?: string;
  blockNumber?: string;
  lot?: string;
  position?: string;
  parking?: string;
  saleValue?: number;
  unitPlanDocumentLink?: string;
  additionalInformation?: string;
  floorLocation?: string;
  parentUnitId?: number;
}

export interface UnitUpdate {
  commercialStock?: string;
  prizedCompliance?: boolean;
  addressStreetName?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressZipCode?: string;
  addressCityId?: number;
  addressStateCode?: string;
  blockName?: string;
  blockNumber?: string;
  lot?: string;
  position?: string;
  parking?: string;
  saleValue?: number;
  unitPlanDocumentLink?: string;
  additionalInformation?: string;
  floorLocation?: string;
  situationId?: number;
}

export interface ChildUnitInsert {
  childUnitIds: number[];
}

export interface UnitCharacteristicInsert {
  description: string;
}

export interface UnitSituationInsert {
  description: string;
}

export interface UnitSituationGet {
  id: number;
  description: string;
}

export interface UnitCharacteristicGet {
  id: number;
  description: string;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface GetResponseDocument {
  resultSetMetadata: ResultSetMetadata;
  results: Unit[];
}

export interface GetAllUnitSituationResponseDocument {
  resultSetMetadata: ResultSetMetadata;
  results: UnitSituationGet[];
}

export interface GetAllUnitCharacteristicsResponseDocument {
  resultSetMetadata: ResultSetMetadata;
  results: UnitCharacteristicGet[];
}

export interface ResponseMessage {
  message: string;
}

// Interface do cliente de API
export interface UnitsClient {
  "GET /units": {
    response: GetResponseDocument;
    searchParams?: {
      limit?: number;
      offset?: number;
      enterpriseId?: number;
      commercialStock?: string;
      name?: string;
      additionalData?: "ALL" | "NONE";
    };
  };

  "POST /units": {
    response: void;
    body: UnitInsert;
  };

  "GET /units/:unitId": {
    response: Unit;
  };

  "PATCH /units/:unitId": {
    response: void;
    body: UnitUpdate;
  };

  "POST /units/:unitId/child-unit": {
    response: void;
    body: ChildUnitInsert;
  };

  "GET /units/characteristics": {
    response: GetAllUnitCharacteristicsResponseDocument;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "POST /units/characteristics": {
    response: void;
    body: UnitCharacteristicInsert;
  };

  "PUT /units/:unitId/characteristics": {
    response: void;
    body: UnitCharacteristic[];
  };

  "GET /units/situations": {
    response: GetAllUnitSituationResponseDocument;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "POST /units/situations": {
    response: void;
    body: UnitSituationInsert;
  };
}

// Função para criar cliente da API
export function createUnitsClient(state: State) {
  return createRestClient<UnitsClient>(state);
}
