import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

export interface Enterprise {
  id: number;
  name: string;
  commercialName?: string;
  enterpriseObservation?: string;
  cnpj?: string;
  type?: string; // 1: Obra e Centro de custo, 2: Obra, 3: Centro de custo, 4: Centro de custo associado a obra
}

export interface DetailedEnterprise extends Enterprise {
  addressDetails?: {
    streetName?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  buildingCostEstimationStatus?: "OPENED" | "CLOSED";
  buildingStatus?:
    | "COST_ESTIMATING"
    | "IN_PROGRESS"
    | "FINISHED_WITH_FINANCIAL_PENDENCIES"
    | "FINISHED_WITHOUT_FINANCIAL_PENDENCIES";
  buildingAppropriationLevel?: string;
  realStateRegistration?: {
    constructionType?: "H" | "V"; // H: Horizontal, V: Vertical
    realEstateRegistrationNumber?: string;
    realEstateRegistrationDigit?: string;
    nationalRealEstateCode?: string;
    realEstateUse?: "0" | "1" | "2"; // 0: Não Residencial, 1: Residencial, 2: Misto
    realEstateType?: "0" | "1"; // 0: Condomínio, 1: Aberto
    recordRealEstateNumber?: string;
    recordRealEstateDate?: string;
    recordSeggregateEstateNumber?: string;
    recordSeggregateEstateDate?: string;
    geographicUrl?: string;
    commomAreas?: string;
    realEstateUrl?: string;
    realEstateLocation?: string;
    realEstateClassification?: string;
    realEstateTargetAudience?: string;
    account?: string;
    validationPartner?: {
      cnpj?: string;
      realEstateSales?: "S" | "N";
      realEstateBankMovement?: "S" | "N";
      realEstateAccountancy?: "S" | "N";
      realEstateBuilding?: "S" | "N";
      realEstateLocalStock?: "S" | "N";
    };
  };
  accountable?: {
    name?: string;
    cpf?: string;
    phone?: string;
    cellphone?: string;
    email?: string;
  };
  associatedBuilding?: {
    id?: number;
    description?: string;
  };
  associatedCostCenters?: {
    id?: number;
    name?: string;
    companyId?: number;
    companyName?: string;
  }[];
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface GetResponseDocument {
  resultSetMetadata: ResultSetMetadata;
  results: Enterprise[];
}

export interface UnitGrouping {
  enterpriseId: number;
  groupings: {
    id: number;
    name: string;
    values: string[];
    units: number[];
  }[];
}

export interface ResponseMessage {
  message: string;
}

// Interface do cliente de API
export interface EnterprisesClient {
  "GET /enterprises": {
    response: GetResponseDocument;
    searchParams?: {
      companyId?: number;
      type?: number;
      limit?: number;
      offset?: number;
      receivableRegister?: "B3" | "CERC";
      onlyBuildingsEnabledForIntegration?: boolean;
    };
  };

  "GET /enterprises/:enterpriseId": {
    response: DetailedEnterprise;
  };

  "GET /enterprises/:enterpriseId/groupings": {
    response: UnitGrouping;
  };
}

// Função para criar cliente da API
export function createEnterprisesClient(state: State) {
  return createRestClient<EnterprisesClient>(state);
}
