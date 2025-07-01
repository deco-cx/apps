export interface PartialRefundResponse {
  uuid: string;
  value: number;
}

export interface GetChargesResponse {
  content: Content[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  first: boolean;
  empty: boolean;
}

export interface Content {
  uuid: string;
  title: string;
  expirationDate: string;
  paidDate: string;
  value: number;
  paymentMethod: string;
  status: string;
  customer: Customer;
  authorizationCode: string;
  authorizationNsu: string;
  refunds: string[];
  retryable: boolean;
}

export interface Customer {
  uuid: string;
  document: string;
  type: string;
  name: string;
  email: string;
  phone: string;
}

export interface Pageable {
  sort: Sort;
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}

export type ChargeStatus =
  | "ABANDONED"
  | "CANCELED"
  | "CHARGEBACK"
  | "DISPUTE"
  | "FAILED"
  | "LATE"
  | "PAID"
  | "PAID_MANUALLY"
  | "PRE_AUTHORIZED"
  | "REFUND"
  | "SCHEDULED";

export type PaymentMethod =
  | "DEBIT_CARD"
  | "APPLE_PAY"
  | "BANK_SLIP"
  | "CREDIT_CARD"
  | "CREDIT_CARD_EARLY_BUYER"
  | "CREDIT_CARD_EARLY_SELLER"
  | "GOOGLE_PAY"
  | "PIX";
