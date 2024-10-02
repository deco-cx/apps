export interface UserResponse {
  ShopperTicketID: string;
  WebSiteID: number;
  CustomerID: number | null;
  CommingFromUrl: string;
  UtmSource: string;
  UtmMedium: null;
  UtmCampaign: null;
  UtmTerm: null;
  UtmContent: null;
  LastTicketID: string;
  CreatedDate: Date;
  TrafficSourceID: null;
  BasketID: number;
  CustomerImpersonation: null;
  IsAuthenticated: boolean;
  IsNewCustomer: boolean;
  Name: string | null;
  SurName: string | null;
  CustomerType: string | number;
  IsGuest: boolean;
  Email: string | null;
  SessionID: string;
  IsActive: boolean;
  IsNewShopper: boolean;
  CustomerGroupID: null;
  CustomerRoles: null;
  MainCustomerGroupID: null;
  BusinessContractID: number[];
  Session: unknown[];
  Wishlist: Wishlist;
  CheckoutAuthorization: null;
  LastOrderID: null;
  Seller: null;
  SalesRepresentative: null;
  HasSalesRepresentative: boolean;
  IsSalesRepresentativeLink: boolean;
  DeliveryPostalCode: null;
  Latitude: null;
  Longitude: null;
  JsonWebToken: null;
  IsEmailConfirmed: boolean;
  MustConfirmEmail: boolean;
}

export interface Wishlist {
  Mode: string;
  WishlistID: number;
  IsAuthenticated: boolean;
}
