import {
  Address,
  Cart,
  CartUpdateResponse,
  CatalogsResponse,
  ProductDetailsResponse,
  ProductListResponse,
  User,
} from "../types.ts";
// import { Props as ProductDetailsProps } from "../../loaders/product/productDetailsPage.ts";
// import { Props as ProductListingPageProps } from "../../loaders/product/productListingPage.ts";
// import { Props as CatalogsProps } from "../../loaders/categories/tree.ts";
import { Props as AddToCartProps } from "../../actions/cart/addItems.ts";
import { Props as CreateDeliveryProps } from "../../actions/cart/createDeliveryAddress.ts";
import { Props as RemoveFromCartProps } from "../../actions/cart/removeItems.ts";
import { Props as SetDeliveryProps } from "../../actions/cart/setDeliveryAddress.ts";
import { Props as UpdateCartProps } from "../../actions/cart/updateItems.ts";

export interface API {
  "GET /users/anonymous/eluxproducts/search": {
    response: ProductListResponse;
  };
  "GET /catalogs?:fields": {
    response: CatalogsResponse;
  };
  "GET /products/:productCode": {
    response: ProductDetailsResponse;
    searchParams: {
      productCode: string;
      fields: string;
    };
  };
  "GET /users/:userId/carts/:cartId": {
    response: Cart;
  };
  "POST /users/:userId/carts": {
    response: Cart;
    searchParams: {
      oldCartId: string | null;
      userId: string;
    };
  };
  "POST /users/:userId/carts/:cartId/entries": {
    response: CartUpdateResponse;
    searchParams: AddToCartProps;
  };
  "DELETE /users/:userId/carts/:cartId/entries/:entryNumber": {
    response: CartUpdateResponse;
    searchParams: RemoveFromCartProps;
  };
  "PUT /users/:userId/carts/:cartId/entries/:entryNumber": {
    response: CartUpdateResponse;
    searchParams: UpdateCartProps;
  };
  "POST /users/:userId/carts/:cartId/addresses/delivery": {
    response: Address;
    searchParams: CreateDeliveryProps;
  };

  "PUT /users/:userId/carts/:cartId/addresses/delivery": {
    response: Address;
    searchParams: SetDeliveryProps;
  };

  "GET /users/:userId": {
    response: User;
    searchParams: {
      userId: string;
    };
  };
  "DELETE /users/:userId": {
    response: User;
    searchParams: {
      fields: string;
      userId: string;
    };
  };
  "PUT /users/:userId": {
    response: User;
    searchParams: {
      fields: string;
      user: User;
      userId: string;
    };
  };
  "PUT /users/:userId/login": {
    response: User;
    searchParams: {
      fields: string;
      newLogin: string;
      password: string;
      userId: string;
    };
  };
  "PUT /users/:userId/password": {
    response: User;
    searchParams: {
      fields: string;
      newPassword: string;
      userId: string;
    };
  };
}
