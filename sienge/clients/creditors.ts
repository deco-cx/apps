import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Creditor Types
export interface CreditorAddress {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  cityCode?: number;
  stateCode?: string;
  countryCode?: number;
}

export interface CreditorPhone {
  ddd?: string;
  number?: string;
  main?: boolean;
  type?: number;
  extension?: string;
  observation?: string;
  id?: number;
}

export interface CreditorPhoneInsert {
  ddd: string;
  number: string;
  type: string;
}

export interface CreditorPhoneUpdate {
  ddd?: string;
  number?: string;
  main?: boolean;
}

export interface ContactInsert {
  name: string;
  ddd?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ContactUpdate {
  name?: string;
  ddd?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ProcuratorInsert {
  name: string;
  cpf?: string;
  rgNumber?: string;
  birthDate?: string;
  emittingOrgan?: string;
}

export interface ProcuratorUpdate {
  name?: string;
  cpf?: string;
  rgNumber?: string;
  birthDate?: string;
  emittingOrgan?: string;
}

export interface AgentInsert {
  code: number;
}

export interface AgentUpdate {
  code: number;
}

export interface PayslipDesonerationYearInsert {
  year: number;
}

export interface PayslipDesonerationYearUpdate {
  year: number;
}

export interface CreditorAddressInsert {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  cityCode: number;
}

export interface CreditorAccountStatementInsert {
  printAccountStatement?: boolean;
  sentByEmail?: boolean;
  email?: string;
}

export interface CreditorForBankingAccountInsert {
  bankCode: string;
  agencyCode: string;
  accountNumber: string;
  operationType?: string;
  main?: boolean;
}

export interface CreditorForBankingAccountUpdate {
  bankCode?: string;
  agencyCode?: string;
  accountNumber?: string;
  operationType?: string;
  main?: boolean;
}

export interface BankInformation {
  id: number;
  bankCode: string;
  agencyCode: string;
  accountNumber: string;
  operationType?: string;
  main: boolean;
}

export interface PixInformation {
  pixKeyType: string;
  pixKey: string;
  main?: boolean;
}

export interface Creditor {
  id: number;
  name: string;
  tradeName?: string;
  cpf?: string;
  cnpj?: string;
  supplier?: string;
  broker?: string;
  employee?: string;
  active: boolean;
  stateRegistrationNumber?: string;
  stateRegistrationType?: string;
  paymentTypeId?: number;
  address?: CreditorAddress;
  phones?: CreditorPhone[];
}

export interface CreditorInsert {
  name: string;
  personType: string;
  typesId: string[];
  registerNumber: string;
  stateRegistrationNumber?: string;
  stateRegistrationType?: string;
  municipalSubscription?: string;
  paymentTypeId?: number;
  phone?: CreditorPhoneInsert;
  agents?: AgentInsert[];
  contacts?: ContactInsert[];
  procurators?: ProcuratorInsert[];
  payslipDesonerationYears?: PayslipDesonerationYearInsert[];
  address: CreditorAddressInsert;
  accountStatement?: CreditorAccountStatementInsert;
}

export interface CreditorUpdate {
  name?: string;
  personType?: string;
  cpf?: string;
  cnpj?: string;
  stateRegistrationNumber?: string;
  stateRegistrationType?: string;
  municipalSubscription?: string;
  address?: CreditorAddressInsert;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface GetResponseCreditors {
  resultSetMetadata: ResultSetMetadata;
  results: Creditor[];
}

export interface GetResponseBankInformation {
  resultSetMetadata: ResultSetMetadata;
  results: BankInformation[];
}

export interface GetResponsePixInformation {
  resultSetMetadata: ResultSetMetadata;
  results: PixInformation[];
}

export interface ResponseMessage {
  status?: number;
  developerMessage?: string;
  userMessage?: string[];
}

// Creditors API Client Interface
export interface CreditorsClient {
  "GET /creditors": {
    response: GetResponseCreditors;
    searchParams?: {
      cpf?: string;
      cnpj?: string;
      creditor?: string;
      limit?: number;
      offset?: number;
    };
  };

  "GET /creditors/:creditorId": {
    response: Creditor;
  };

  "POST /creditors": {
    response: void;
    body: CreditorInsert;
  };

  "PATCH /creditors/:creditorId": {
    response: void;
    body: CreditorUpdate;
  };

  "GET /creditors/:creditorId/bank-informations": {
    response: GetResponseBankInformation;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "POST /creditors/:creditorId/bank-informations": {
    response: void;
    body: CreditorForBankingAccountInsert;
  };

  "PATCH /creditors/:creditorId/bank-informations/:banckInformationId": {
    response: void;
    body: CreditorForBankingAccountUpdate;
  };

  "GET /creditors/:creditorId/pix-informations": {
    response: GetResponsePixInformation;
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "POST /creditors/:creditorId/pix-informations": {
    response: void;
    body: PixInformation;
  };

  "PATCH /creditors/:creditorId/pix-informations/:pixInformationId": {
    response: void;
    body: PixInformation;
  };

  "PATCH /creditors/:creditorId/phone/:phoneId": {
    response: void;
    body: CreditorPhoneUpdate;
  };

  "PATCH /creditors/:creditorId/contact/:contactId": {
    response: void;
    body: ContactUpdate;
  };

  "PATCH /creditors/:creditorId/procurator/:procuratorId": {
    response: void;
    body: ProcuratorUpdate;
  };

  "PUT /creditors/:creditorId/agents": {
    response: void;
    body: AgentUpdate[];
  };

  "PUT /creditors/:creditorId/payslip-desoneration-years": {
    response: void;
    body: PayslipDesonerationYearUpdate[];
  };

  "PUT /creditors/:creditorId/activate": {
    response: void;
  };

  "PUT /creditors/:creditorId/deactivate": {
    response: void;
  };
}

// Function to create client
export function createCreditorsClient(state: State) {
  return createRestClient<CreditorsClient>(state);
}
