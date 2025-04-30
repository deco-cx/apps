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

// Tipos para títulos
export interface Bill {
  customerId?: number;
  receivableBillId?: number;
  documentId?: string;
  documentNumber?: string;
  issueDate?: string;
  receivableBillValue?: number;
  companyId?: number;
  defaulting?: boolean;
  subjudice?: boolean;
  note?: string;
  payOffDate?: string;
}

export interface BillByID extends Bill {
  normal?: boolean;
  inBilling?: boolean;
}

export interface GetResponseBills {
  resultSetMetadata: ResultSetMetadata;
  results: Bill[];
}

// Tipos para parcelas
export interface Installment {
  receivableBillId?: number;
  installmentId?: number;
  carrierId?: number;
  conditionTypeId?: string;
  dueDate?: string;
  balanceDue?: number;
  generatedTicket?: boolean;
}

export interface InstallmentDueDate {
  newDueDate: string;
}

export interface GetResponseInstallments {
  resultSetMetadata: ResultSetMetadata;
  results: Installment[];
}

// Tipos para apropriações financeiras
export interface Link {
  rel?: string;
  href?: string;
}

export interface BudgetCategory {
  costCenterId?: number;
  paymentCategoriesId?: string;
  percentage?: number;
  links?: Link[];
}

export interface GetResponseBudgetCategories {
  resultSetMetadata: ResultSetMetadata;
  results: BudgetCategory[];
}

// Interface do cliente de API
export interface AccountsReceivableClient {
  "GET /accounts-receivable/receivable-bills": {
    response: GetResponseBills;
    searchParams: {
      customerId: number;
      companyId?: number;
      costCenterId?: number;
      paidOff?: boolean;
      limit?: number;
      offset?: number;
    };
  };

  "GET /accounts-receivable/receivable-bills/:receivableBillId": {
    response: BillByID;
  };

  "GET /accounts-receivable/receivable-bills/:receivableBillId/installments": {
    response: GetResponseInstallments;
    searchParams: {
      carrierIdIn?: number;
      carrierIdNotIn?: number[];
      limit?: number;
      offset?: number;
    };
  };

  "PATCH /accounts-receivable/receivable-bills/:receivableBillId/installments/:installmentId/change-due-date":
    {
      response: void;
      body: InstallmentDueDate;
    };

  "GET /accounts-receivable/:receivableBillId/budget-categories": {
    response: GetResponseBudgetCategories;
    searchParams: {
      limit?: number;
      offset?: number;
    };
  };
}

// Função para criar cliente da API
export function createAccountsReceivableClient(state: State) {
  return createRestClient<AccountsReceivableClient>(state);
}
