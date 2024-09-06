import { LinxError } from "./shared.ts";

export interface LoginResponse {
  CustomerID: number;
  CustomerHash: string;
  SessionID: string;
  ShopperTicketID: string;
  RefreshToken: string;
  BasketID: number;
  BasketAuthorityToken: string;
  DocumentNumber: string;
  MustConfirmEmail: boolean;
  MustInformPin: boolean;
  IsAuthenticated: boolean;
  IsValid: boolean;
  Errors: LinxError[];
}
