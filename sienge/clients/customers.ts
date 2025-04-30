import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos de dados para clientes
export interface Customer {
  id: number;
  code: string;
  description: string;
  complementaryDescription?: string;
  active: boolean;
  noCommunication: boolean;
  birthDate?: string;
  phoneNumber?: string;
  cellPhoneNumber?: string;
  faxNumber?: string;
  email?: string;
  homeAddress?: string;
  homeNumber?: string;
  homeComplement?: string;
  homeNeighborhood?: string;
  homeCityId?: number;
  homeCityName?: string;
  homeStateId?: number;
  homeStateName?: string;
  homeCountryId?: number;
  homeCountryName?: string;
  homeZipCode?: string;
  otherAddressInformation?: string;
  cpf?: string;
  cnpj?: string;
  internationalId?: string;
  idDocumentType?: number;
  idDocument?: string;
  idStateEmitter?: number;
  idEmitter?: string;
  idEmissionDate?: string;
  motherName?: string;
  fatherName?: string;
  customerTypeId?: number;
  customerTypeName?: string;
  professionId?: number;
  professionName?: string;
  civilStateId?: number;
  civilStateName?: string;
  corporateName?: string;
  stateSubscription?: string;
  municipalSubscription?: string;
  nationality?: string;
  personType: number; // 0 - Física, 1 - Jurídica
  gender?: string;
  spouse?: CustomerSpouse;
  phones?: CustomerPhone[];
  createdAt: string;
  modifiedAt: string;
}

export interface CustomerPhone {
  id?: number;
  type: number; // 0 - Residencial, 1 - Comercial, 2 - Celular, 3 - Recado, 4 - Fax
  number: string;
  contactName?: string;
}

export interface CustomerSpouse {
  id?: number;
  name: string;
  phoneNumber?: string;
  cellPhoneNumber?: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
  professionId?: number;
  professionName?: string;
  idDocumentType?: number;
  idDocument?: string;
  idStateEmitter?: number;
  idEmitter?: string;
  idEmissionDate?: string;
  stateSubscription?: string;
  municipalSubscription?: string;
  gender?: string;
}

export interface CustomerInsert {
  code: string;
  description: string;
  complementaryDescription?: string;
  active?: boolean;
  noCommunication?: boolean;
  birthDate?: string;
  phoneNumber?: string;
  cellPhoneNumber?: string;
  faxNumber?: string;
  email?: string;
  homeAddress?: string;
  homeNumber?: string;
  homeComplement?: string;
  homeNeighborhood?: string;
  homeCityId?: number;
  homeZipCode?: string;
  otherAddressInformation?: string;
  cpf?: string;
  cnpj?: string;
  internationalId?: string;
  idDocumentType?: number;
  idDocument?: string;
  idStateEmitter?: number;
  idEmitter?: string;
  idEmissionDate?: string;
  motherName?: string;
  fatherName?: string;
  customerTypeId?: number;
  professionId?: number;
  civilStateId?: number;
  corporateName?: string;
  stateSubscription?: string;
  municipalSubscription?: string;
  nationality?: string;
  personType: number; // 0 - Física, 1 - Jurídica
  gender?: string;
  phones?: CustomerPhone[];
  spouse?: CustomerSpouse;
}

export interface CustomerUpdate {
  code?: string;
  description?: string;
  complementaryDescription?: string;
  active?: boolean;
  noCommunication?: boolean;
  birthDate?: string;
  phoneNumber?: string;
  cellPhoneNumber?: string;
  faxNumber?: string;
  email?: string;
  homeAddress?: string;
  homeNumber?: string;
  homeComplement?: string;
  homeNeighborhood?: string;
  homeCityId?: number;
  homeZipCode?: string;
  otherAddressInformation?: string;
  idDocumentType?: number;
  idDocument?: string;
  idStateEmitter?: number;
  idEmitter?: string;
  idEmissionDate?: string;
  motherName?: string;
  fatherName?: string;
  customerTypeId?: number;
  professionId?: number;
  civilStateId?: number;
  corporateName?: string;
  stateSubscription?: string;
  municipalSubscription?: string;
  nationality?: string;
  gender?: string;
}

export interface CustomerPhonesUpdate {
  phones: CustomerPhone[];
}

export interface CustomerFamilyIncome {
  id?: number;
  description: string;
  value: number;
}

export interface CustomerAddress {
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  cityId?: number;
  zipCode?: string;
}

export interface CustomerAttachment {
  id?: number;
  fileName: string;
  description?: string;
  file: string;
}

export interface CustomerProcurator {
  id?: number;
  name: string;
  phoneNumber?: string;
  cellPhoneNumber?: string;
  email?: string;
  cpf?: string;
  birthDate?: string;
}

export interface GetResponseDocument {
  data: Customer[];
  total: number;
}

export interface ResponseMessage {
  message: string;
}

// Cliente API interface
export interface CustomersClient {
  "GET /customers": {
    response: GetResponseDocument;
    searchParams?: {
      cpf?: string;
      cnpj?: string;
      internationalId?: string;
      onlyActive?: boolean;
      enterpriseId?: number;
      createdAfter?: string;
      createdBefore?: string;
      modifiedAfter?: string;
      modifiedBefore?: string;
      limit?: number;
      offset?: number;
    };
  };

  "POST /customers": {
    response: void;
    body: CustomerInsert;
  };

  "GET /customers/:id": {
    response: Customer;
  };

  "PATCH /customers/:id": {
    response: void;
    body: CustomerUpdate;
  };

  "PUT /customers/:id/phones": {
    response: void;
    body: CustomerPhonesUpdate;
  };

  "PUT /customers/:id/spouse": {
    response: void;
    body: CustomerSpouse;
  };

  "GET /customers/:id/familyIncomes": {
    response: {
      data: CustomerFamilyIncome[];
    };
  };

  "POST /customers/:id/familyIncomes": {
    response: void;
    body: {
      familyIncomes: CustomerFamilyIncome[];
    };
  };

  "PUT /customers/:id/addresses/:type": {
    response: void;
    body: CustomerAddress;
  };

  "GET /customers/:id/attachments": {
    response: {
      data: CustomerAttachment[];
    };
  };

  "POST /customers/:id/attachments": {
    response: void;
    body: {
      attachments: CustomerAttachment[];
    };
  };

  "GET /customers/:id/attachments/:attachmentId": {
    response: CustomerAttachment;
  };

  "DELETE /customers/:id/attachments/:attachmentId": {
    response: void;
  };

  "PUT /customers/:id/procurator": {
    response: void;
    body: CustomerProcurator;
  };

  "GET /customers/:id/procurator": {
    response: CustomerProcurator;
  };
}

// Função para criar cliente da API
export function createCustomersClient(state: State) {
  return createRestClient<CustomersClient>(state);
}
