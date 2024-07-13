export interface SaveWishlistResponse {
  WishlistID: number
  Name: string
  Address: Address
  Type: string
  PrivacyType: string
  IsActive: boolean
  Products: Product[]
  MetadataValues: MetadataValue2[]
  IsValid: boolean
  Errors: Error[]
  Warnings: string[]
}

export interface AddProductsToWishlistResponse {
  SavedWishlistProductIDs: number[]
  IsValid: boolean
  Errors: Error[]
  Warnings: string[]
}

export interface Error {
  Key: string
  ErrorMessage: string
  ErrorCode: string
  HelpEntry: string
  TechnicalMessage: string
}

export interface Address {
  ID: number
  Name: string
  PostalCode: string
  AddressLine: string
}

export interface Product {
  SkuID: number
  Name: string
  Value: number
  PromoPrice: number
  Active: boolean
  MetadataValues: MetadataValue[]
}

export interface MetadataValue {
  DisplayName: string
  FormattedValue: string
}

export interface MetadataValue2 {
  PropertyName: string
  SerializedValue: string
}

export interface Error {
  Key: string
  ErrorMessage: string
  ErrorCode: string
  HelpEntry: string
  TechnicalMessage: string
}
