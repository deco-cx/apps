// Types for the ClearSale API client

// Authentication Types
export interface AuthenticationRequest {
  Username: string;
  Password: string;
}

export interface AuthenticationResponse {
  token: string;
  expiresInSeconds: number;
}

// Address Types
export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country: string;
}

// Phone Types
export interface Phone {
  countryCode: number;
  areaCode: number;
  number: number;
  verified: boolean;
}

// Card Types
export interface Card {
  bin: string;
  last4: string;
  ownerDocument: string;
  ownerName: string;
}

// Vehicle Types
export interface Vehicle {
  ProposedDate: string; // ISO date string
  VehicleLicensePlate: string;
  StoreState: string;
  LicensePlateState: string;
  VehicleRegistrationState: string;
  FinancingAmount: number;
  MarketValue: number;
  VehicleManufacturingYear: number;
}

// Transaction Types
export interface CreateTransactionRequest {
  // Required fields
  documentType: string;
  document: string;

  // Optional fields (can be null or undefined)
  name?: string;
  birthdate?: string; // ISO date string (YYYY-MM-DD)
  mothersName?: string;
  email?: string;
  verifiedEmail?: boolean;
  sessionId?: string;
  identifierId?: string;
  channelId?: string | number;
  address?: Address;
  phone?: Phone;
  identifierDate?: string; // ISO date string
  type?: number;
  // deno-lint-ignore no-explicit-any
  genericFields?: any; // Can be any object or null
  criterion?: number;
  card?: Card;
  Vehicle?: Vehicle;
  secondaryDocumentType?: string;
  secondaryDocument?: string;
}

export interface TransactionResponse {
  id: string;
  createdAt: string;
}

export interface TransactionDetailsResponse
  extends TransactionResponse, CreateTransactionRequest {
  referenceDate?: string;
  // deno-lint-ignore no-explicit-any
  complements?: any[];
}

// Score Types
export interface Score {
  value: number;
  reason: string;
  createdAt: string;
}

// Client interface
export interface API {
  // Authentication
  "POST /v1/authentication": {
    response: AuthenticationResponse;
    body: AuthenticationRequest;
  };

  // Transactions
  "POST /v1/transaction": {
    response: TransactionResponse;
    body: CreateTransactionRequest;
  };

  "GET /v1/transaction/:transactionId": {
    response: TransactionDetailsResponse;
  };

  // Fraud Scores
  "GET /v1/transaction/:transactionId/scores": {
    response: Score[];
  };

  "POST /v1/transaction/:transactionId/scores": {
    response: Score[];
  };
}
