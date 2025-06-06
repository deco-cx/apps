import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para contratos de vendas
export interface SalesContract {
  id: number;
  number: string;
  issueDate?: string;
  unitId: number;
  unitCode?: string;
  unitName?: string;
  unitTypeId?: number;
  unitTypeName?: string;
  customerId: number;
  customerCode?: string;
  customerName?: string;
  companyId: number;
  companyName?: string;
  enterpriseId: number;
  enterpriseName?: string;
  externalId?: string;
  saleDate?: string;
  financingTypeId?: number;
  financingTypeName?: string;
  senderName?: string;
  indexerId?: number;
  indexerName?: string;
  gracePeriod?: number;
  gracePeriodIndex?: number;
  gracePeriodUnit?: number;
  chargeInterestOnGracePeriod?: boolean;
  salePersonId?: number;
  salePersonName?: string;
  brokerId?: number;
  brokerName?: string;
  includePropertyTaxInValue?: boolean;
  pricingTable?: string;
  pricingTableDiscount?: number;
  adjustment?: number;
  contractualAdjustmentValue?: number;
  saleValue?: number;
  commission?: number;
  situation: number; // 0 - Solicitado, 1 - Autorizado, 2 - Emitido, 3 - Cancelado
  cancelDate?: string;
  cancelReason?: string;
  updateObservation?: string;
  customerName2?: string;
  customerCpf2?: string;
  customerParticipationPercent2?: number;
  totalValue?: number;
  attachments?: ContractAttachment[];
  guarantors?: ContractGuarantor[];
  installments?: ContractInstallment[];
  createdAt: string;
  modifiedAt: string;
}

export interface ContractAttachment {
  id?: number;
  file: string;
  description?: string;
}

export interface ContractGuarantor {
  id?: number;
  guarantorId: number;
  guarantorName?: string;
  guarantorCode?: string;
  guarantorCpf?: string;
  guarantorCnpj?: string;
}

export interface ContractInstallment {
  id?: number;
  code?: string;
  number?: number;
  dueDate: string;
  value: number;
  indexerId?: number;
  paidIndexerId?: number;
  applicationId?: number;
  paidApplicationId?: number;
  accountId?: number;
  paidAccountId?: number;
  systemTypeId?: number;
  observation?: string;
  chargeDay?: number;
  situation?: number;
  personTypeId?: number;
  federalRegistration?: string;
  warranterId?: number;
  warranterCode?: string;
  warranterName?: string;
  warranterCpfCnpj?: string;
}

export interface SalesContractInsert {
  number?: string;
  issueDate?: string;
  unitId: number;
  customerId: number;
  companyId: number;
  enterpriseId: number;
  externalId?: string;
  saleDate?: string;
  financingTypeId?: number;
  senderName?: string;
  indexerId?: number;
  gracePeriod?: number;
  gracePeriodIndex?: number;
  gracePeriodUnit?: number;
  chargeInterestOnGracePeriod?: boolean;
  salePersonId?: number;
  brokerId?: number;
  includePropertyTaxInValue?: boolean;
  pricingTable?: string;
  pricingTableDiscount?: number;
  adjustment?: number;
  contractualAdjustmentValue?: number;
  saleValue?: number;
  commission?: number;
  customerName2?: string;
  customerCpf2?: string;
  customerParticipationPercent2?: number;
  attachments?: ContractAttachment[];
  guarantors?: ContractGuarantor[];
  installments?: ContractInstallment[];
}

export interface ContractGuarantorPhone {
  id?: number;
  type: number; // 0 - Residencial, 1 - Comercial, 2 - Celular, 3 - Recado, 4 - Fax
  number: string;
  contactName?: string;
}

export interface ContractCancellation {
  cancelDate: string;
  cancelReason: string;
}

export interface SalesContractsGet {
  contracts: SalesContract[];
  total: number;
}

export interface SalesContractGet {
  contract: SalesContract;
}

export interface ResponseMessage {
  message: string;
}

// Interface do cliente de API
export interface SalesContractsClient {
  "GET /sales-contracts": {
    response: SalesContractsGet;
    searchParams?: {
      limit?: number;
      offset?: number;
      customerId?: number;
      companyId?: number;
      enterpriseId?: number;
      enterpriseName?: string;
      externalId?: string;
      unitId?: number;
      number?: string;
      situation?: string[];
      createdAfter?: string;
      createdBefore?: string;
      modifiedAfter?: string;
      modifiedBefore?: string;
      onlyContractsWithoutCommission?: boolean;
      initialIssueDate?: string;
      finalIssueDate?: string;
      initialCancelDate?: string;
      finalCancelDate?: string;
    };
  };

  "POST /sales-contracts": {
    response: void;
    body: SalesContractInsert;
  };

  "GET /sales-contracts/:id": {
    response: SalesContractGet;
  };

  "DELETE /sales-contracts/:id": {
    response: void;
  };

  "GET /sales-contracts/:id/attachments": {
    response: {
      contractAttachments: ContractAttachment[];
    };
  };

  "POST /sales-contracts/:id/attachments": {
    response: void;
    body: {
      contractAttachments: ContractAttachment[];
    };
  };

  "GET /sales-contracts/:id/attachments/:attachmentId": {
    response: ContractAttachment;
  };

  "DELETE /sales-contracts/:id/attachments/:attachmentId": {
    response: void;
  };

  "GET /sales-contracts/:id/guarantors": {
    response: {
      guarantors: ContractGuarantor[];
    };
  };

  "POST /sales-contracts/:id/guarantors": {
    response: void;
    body: {
      guarantors: ContractGuarantor[];
    };
  };

  "DELETE /sales-contracts/:id/guarantors/:guarantorId": {
    response: void;
  };

  "PUT /sales-contracts/:id/guarantors/:guarantorId/phones": {
    response: void;
    body: {
      phones: ContractGuarantorPhone[];
    };
  };

  "PUT /sales-contracts/:id/cancellation": {
    response: void;
    body: ContractCancellation;
  };
}

// Função para criar cliente da API
export function createSalesContractsClient(state: State) {
  return createRestClient<SalesContractsClient>(state);
}
