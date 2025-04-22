import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para metadados de resultados
export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

// Tipos para mensagens de resposta
export interface ResponseMessage {
  status?: number;
  developerMessage?: string;
  clientMessage?: string;
}

// Tipos básicos
export interface Bills {
  resultSetMetadata: ResultSetMetadata;
  results: Bill[];
}

export interface Bill {
  billId: number;
  debtorId: number;
  creditorId: number;
  issueDate: string;
  documentNumber?: string;
  documentsIdentificationId?: string;
  billValue: number;
  retainedTaxValue?: number;
  netValue?: number;
  originId?: string;
  status?: string;
  note?: string;
  discount?: number;
  addition?: number;
  additionalInformation?: BillAdditionalInformation;
  installments?: BillInstallment[];
}

export interface BillAdditionalInformation {
  duplicationControl?: boolean;
  hasNegotiationDate?: boolean;
  negotiationDate?: string;
  creditCardNumber?: string;
  creditCardFlag?: string;
  creditCardExpirationDate?: string;
  creditCardHolder?: string;
}

export interface BillInstallment {
  installmentId: number;
  dueDate: string;
  grossValue: number;
  discount?: number;
  addition?: number;
  paymentDate?: string;
  paymentValue?: number;
  checkingAccountId?: number;
  paymentCardId?: string;
  referenceDueDate?: string;
  referenceParcel?: number;
  barcode?: string;
  note?: string;
}

export interface BillInstallmentUpdate {
  dueDate?: string;
  discount?: number;
  addition?: number;
  note?: string;
}

// Tipos para inserção/atualização
export interface BillInsert {
  debtorId: number;
  creditorId: number;
  issueDate: string;
  documentNumber?: string;
  documentsIdentificationId?: string;
  billValue: number;
  retainedTaxValue?: number;
  originId?: string;
  note?: string;
  discount?: number;
  addition?: number;
  additionalInformation?: BillAdditionalInformation;
  installments: BillInstallment[];
  budgetCategories?: BillBudgetCategory[];
  departments?: BillDepartment[];
  enterprises?: BillEnterprise[];
}

export interface BillUpdate {
  documentNumber?: string;
  documentsIdentificationId?: string;
  note?: string;
  additionalInformation?: BillAdditionalInformation;
}

export interface ElectronicInvoiceBillInsert {
  debtorId: number;
  creditorId: number;
  documentNumber?: string;
  retainedTaxValue?: number;
  discount?: number;
  addition?: number;
  budgetCategories?: BillBudgetCategory[];
  departments?: BillDepartment[];
  enterprises?: BillEnterprise[];
  electronicInvoice: ElectronicInvoice;
}

export interface ElectronicInvoice {
  documentNumber: string;
  issueDate: string;
  value: number;
  installments: BillInstallment[];
}

// Tipos para categorias de orçamento
export interface BillBudgetCategory {
  costCenterId: number;
  paymentCategoryId: string;
  value: number;
}

export interface GetResponseBillBudgetCategories {
  resultSetMetadata: ResultSetMetadata;
  results: BillBudgetCategory[];
}

// Tipos para departamentos
export interface BillDepartment {
  departmentId: number;
  value: number;
}

export interface GetResponseBillDepartments {
  resultSetMetadata: ResultSetMetadata;
  results: BillDepartment[];
}

// Tipos para obras
export interface BillEnterprise {
  enterpriseId: number;
  value: number;
}

export interface GetResponseBillEnterprises {
  resultSetMetadata: ResultSetMetadata;
  results: BillEnterprise[];
}

// Tipos para parcelas
export interface GetResponseBillInstallments {
  resultSetMetadata: ResultSetMetadata;
  results: BillInstallment[];
}

// Tipos para informações de pagamento
export interface BankTransfer {
  bankId: number;
  agency: string;
  accountType: string;
  account: string;
  holder: string;
  document: string;
  documentType: string;
}

export interface BoletoBancario {
  barcode: string;
}

export interface BoletoConcessionaria {
  barcode: string;
}

export interface BoletoTax {
  barcode: string;
}

// Interface do cliente de API
export interface BillDebtClient {
  "GET /bills": {
    response: Bills;
    searchParams: {
      startDate: string;
      endDate: string;
      debtorId?: number;
      creditorId?: number;
      costCenterId?: number;
      documentsIdentificationId?: string[];
      documentNumber?: string;
      status?: string;
      originId?: string;
      limit?: number;
      offset?: number;
    };
  };

  "POST /bills": {
    response: void;
    body: BillInsert;
  };

  "GET /bills/by-change-date": {
    response: Bills;
    searchParams: {
      startDate: string;
      endDate: string;
      debtorId?: number;
      creditorId?: number;
      costCenterId?: number;
      documentsIdentificationId?: string[];
      documentNumber?: string;
      status?: string;
      originId?: string;
      limit?: number;
      offset?: number;
    };
  };

  "GET /bills/:billId": {
    response: Bill;
  };

  "PATCH /bills/:billId": {
    response: void;
    body: BillUpdate;
  };

  "POST /eletronic-invoice-bills": {
    response: void;
    body: ElectronicInvoiceBillInsert;
  };

  "GET /bills/:billId/installments": {
    response: GetResponseBillInstallments;
    searchParams: {
      limit?: number;
      offset?: number;
    };
  };

  "PATCH /bills/:billId/installments/:installmentId": {
    response: void;
    body: BillInstallmentUpdate;
  };

  "PATCH /bills/:billId/installments/:installmentId/payment-information/bank-transfer":
    {
      response: void;
      body: BankTransfer;
    };

  "GET /bills/:billId/installments/:installmentId/payment-information/bank-transfer":
    {
      response: BankTransfer;
    };

  "PATCH /bills/:billId/installments/:installmentId/payment-information/boleto-bancario":
    {
      response: void;
      body: BoletoBancario;
    };

  "GET /bills/:billId/installments/:installmentId/payment-information/boleto-bancario":
    {
      response: BoletoBancario;
    };

  "PATCH /bills/:billId/installments/:installmentId/payment-information/boleto-concessionaria":
    {
      response: void;
      body: BoletoConcessionaria;
    };

  "GET /bills/:billId/installments/:installmentId/payment-information/boleto-concessionaria":
    {
      response: BoletoConcessionaria;
    };

  "PATCH /bills/:billId/installments/:installmentId/payment-information/boleto-tax":
    {
      response: void;
      body: BoletoTax;
    };

  "GET /bills/:billId/installments/:installmentId/payment-information/boleto-tax":
    {
      response: BoletoTax;
    };
}

// Função para criar cliente da API
export function createBillDebtClient(state: State) {
  return createRestClient<BillDebtClient>(state);
}
