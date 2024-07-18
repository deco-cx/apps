export interface SaveWishlistResponse {
  WishlistID: number;
  Name: string;
  Address: Address;
  Type: string;
  PrivacyType: string;
  IsActive: boolean;
  Products: Product[];
  MetadataValues: MetadataValue2[];
  IsValid: boolean;
  Errors: Error[];
  Warnings: string[];
}

export interface DeleteWishlistResponse {
  WishlistID: number;
  Name: string;
  IsValid: boolean;
  Errors: Error[];
  Warnings: string[];
}

export interface AddProductsToWishlistResponse {
  SavedWishlistProductIDs: number[];
  IsValid: boolean;
  Errors: Error[];
  Warnings: string[];
}

export interface DeleteProductsFromWishlistResponse {
  DeletedWishlistProductIDs: number[];
  IsValid: boolean;
  Errors: Error[];
  Warnings: string[];
}

export interface SearchWishlistResponse {
  Page: Page;
  Result: Result[];
  IsValid: boolean;
  Errors: Error[];
  Warnings: string[];
}

export interface ShareWishlistResponse {
  IsValid: boolean;
  Errors: Error[];
  Warnings: string[];
}

export interface Page {
  Index: number;
  PageCount: number;
  RecordCount: number;
  PageSize: number;
  ErrorMessage: string;
}

export interface Result {
  Email: string;
  CPF: string;
  MetadataValues: MetadataValue3[];
  WishlistProducts: WishlistProduct[];
  WishlistID: number;
  Hash: string;
  CustomerID: number;
  Name: string;
  Description: string;
  PrivacyType: string;
  Password: string;
  IsActive: boolean;
  CreatedDate: string;
  ModifiedDate: string;
  DeliveryAddressID: number;
  EndPurchaseDate: string;
  PurchasingBehavior: string;
  WishlistDefinitionID: number;
}

export interface MetadataValue3 {
  PropertyMetadataID: number;
  PropertyName: string;
  PropertyGroup: string;
  InputType: string;
  Value: unknown;
  SerializedValue: string;
  SerializedBlobValue: string;
  IntegrationID: string;
  FormattedValue: string;
  DisplayName: string;
}

export interface WishlistProduct {
  WishlistProductID: number;
  ProductID: number;
  SkuID: number;
  QuantityDesired: number;
  QuantityReceived: number;
  Balance: number;
}

export interface Error {
  Key: string;
  ErrorMessage: string;
  ErrorCode: string;
  HelpEntry: string;
  TechnicalMessage: string;
}

export interface Address {
  ID: number;
  Name: string;
  PostalCode: string;
  AddressLine: string;
}

export interface Product {
  SkuID: number;
  Name: string;
  Value: number;
  PromoPrice: number;
  Active: boolean;
  MetadataValues: MetadataValue[];
}

export interface MetadataValue {
  DisplayName: string;
  FormattedValue: string;
}

export interface MetadataValue2 {
  PropertyName: string;
  SerializedValue: string;
}

export interface Error {
  Key: string;
  ErrorMessage: string;
  ErrorCode: string;
  HelpEntry: string;
  TechnicalMessage: string;
}

export interface WishlistItem {
  ProductID: number;
  SkuID: number;
  WebSiteID: number;
  Quantity: number;
  QuantityReceived: number;
  NestedItens: string;
}
