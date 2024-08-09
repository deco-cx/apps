import {
  Address,
  Cart,
  CartUpdateResponse,
  CatalogsResponse,
  FieldsList,
  ProductDetailsResponse,
  ProductListResponse,
  User,
} from "../types.ts";
import { Props as ProductDetailsProps } from "../../loaders/product/productDetailsPage.ts";
import { Props as ProductListingPageProps } from "../../loaders/product/productListingPage.ts";
import { Props as CatalogsProps } from "../../loaders/categories/tree.ts";
import { Props as AddToCartProps } from "../../actions/cart/addItems.ts";
import { Props as CreateDeliveryProps } from "../../actions/cart/createDeliveryAddress.ts";
import { Props as RemoveFromCartProps } from "../../actions/cart/removeItems.ts";
import { Props as SetDeliveryProps } from "../../actions/cart/setDeliveryAddress.ts";
import { Props as UpdateCartProps } from "../../actions/cart/updateItems.ts";

export interface API {
  "GET /categories/:categoryId/products": {
    response: ProductListResponse;
    searchParams: ProductListingPageProps;
  };
  "GET /catalogs?:fields": {
    response: CatalogsResponse;
    searchParams: CatalogsProps;
  };
  "GET /orgProducts/:productCode": {
    response: ProductDetailsResponse;
    searchParams: ProductDetailsProps;
  };

  "GET /users/:userId/carts/:cartId": {
    response: Cart;
    searchParams: {
      cartId: string;
      userId: string;
    };
  };
  "POST /users/:userId/carts": {
    response: Cart;
    searchParams: {
      oldCartId: string | null;
      userId: string;
    };
  };
  "POST ​/users​/:userId​/carts​/:cartId​/entries": {
    response: CartUpdateResponse;
    searchParams: AddToCartProps;
  };
  "DELETE ​/users​/:userId​/carts​/:cartId​/entries/:entryNumber": {
    response: CartUpdateResponse;
    searchParams: RemoveFromCartProps;
  };
  "PUT ​/users​/:userId​/carts​/:cartId​/entries/:entryNumber": {
    response: CartUpdateResponse;
    searchParams: UpdateCartProps;
  };
  "POST ​/users​/:userId​/carts​/:cartId​/addresses/delivery": {
    response: Address;
    searchParams: CreateDeliveryProps;
  };
  "PUT ​/users​/:userId​/carts​/:cartId​/addresses/delivery": {
    response: Address;
    searchParams: SetDeliveryProps;
  };

  "GET /users/:userId": {
    response: User;
    searchParams: {
      userId: string;
    };
  };
  "DELETE ​/users​/:userId": {
    response: User;
    searchParams: {
      fields: FieldsList;
      userId: string;
    };
  };
  "PUT ​/users​/:userId": {
    response: User;
    searchParams: {
      fields: FieldsList;
      user: User;
      userId: string;
    };
  };
  "PUT ​/users​/:userId/login": {
    response: User;
    searchParams: {
      fields: FieldsList;
      newLogin: string;
      password: string;
      userId: string;
    };
  };
  "PUT ​/users​/:userId/password": {
    response: User;
    searchParams: {
      fields: FieldsList;
      newPassword: string;
      userId: string;
    };
  };
}
