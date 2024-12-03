import {
  AddProductsToWishlistResponse,
  DeleteProductsFromWishlistResponse,
  DeleteWishlistResponse,
  SaveWishlistResponse,
  SearchWishlistResponse,
  ShareWishlistResponse,
} from "./types/wishlistJSON.ts";

export interface LayerAPI {
  "POST /v1/Profile/API.svc/web/SearchWishlist": {
    response: SearchWishlistResponse;
    body: {
      Page: {
        PageIndex: number;
        PageSize: number;
      };
      Where?: string;
      WhereMetadata?: string;
      OrderBy?: string;
    };
  };

  "POST /v1/Profile/API.svg/web/ShareWishlist": {
    response: ShareWishlistResponse;
    body: {
      WishlistID: number;
      WebSiteID?: number;
      Recipients: string;
      Message: string;
    };
  };

  "POST /v1/Profile/API.svc/web/SaveWishlist": {
    response: SaveWishlistResponse;
    body: {
      ExtendedProperties?: {
        Name: string;
        Value: unknown;
        Values: unknown[];
      }[];
      WishlistID?: number;
      CustomerID: number;
      IsActive: boolean;
      Name: string;
      Description: string;
      PrivacyType?: "0 - Public" | "2 - Private";
      Hash?: string;
      Password?: string;
      CreatedDate?: string;
      ModifiedDate?: string;
      DeliveryAddressID?: number;
      EndPurchaseDate?: string;
      PurchasingBehavior?: string;
      WishlistDefinitionID?: number;
    };
  };

  "POST /v1/Profile/API.svc/web/AddProductsToWishlist": {
    response: AddProductsToWishlistResponse;
    body: {
      WishlistID: number;
      CustomerID: number;
      WishlistProducts: {
        ProductID: number;
        SkuID?: number;
        WebSiteID?: number;
        Quantity?: number;
        QuantityReceived?: number;
        NestedItens?: string;
      }[];
    };
  };

  "POST /v1/Profile/API.svc/web/DeleteWishlist": {
    response: DeleteWishlistResponse;
    body: {
      WishlistID: number;
    };
  };

  "POST /v1/Profile/API.svc/web/DeleteProductsFromWishlist": {
    response: DeleteProductsFromWishlistResponse;
    body: {
      WishlistID: number;
      CustomerID: number;
      WishlistProductIDs: number[];
    };
  };
}
