// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $$$0 from "./loaders/productList.ts";
import * as $$$1 from "./loaders/productDetailsPage.ts";
import * as $$$2 from "./loaders/productListingPage.ts";
import * as $$$3 from "./loaders/proxy.ts";
import * as $$$4 from "./loaders/cart.ts";
import * as $$$$0 from "./handlers/sitemap.ts";
import * as $$$$$$$$$0 from "./actions/cart/updateItems.ts";
import * as $$$$$$$$$1 from "./actions/cart/addItems.ts";

const manifest = {
  "loaders": {
    "nuvemshop/loaders/cart.ts": $$$4,
    "nuvemshop/loaders/productDetailsPage.ts": $$$1,
    "nuvemshop/loaders/productList.ts": $$$0,
    "nuvemshop/loaders/productListingPage.ts": $$$2,
    "nuvemshop/loaders/proxy.ts": $$$3,
  },
  "handlers": {
    "nuvemshop/handlers/sitemap.ts": $$$$0,
  },
  "actions": {
    "nuvemshop/actions/cart/addItems.ts": $$$$$$$$$1,
    "nuvemshop/actions/cart/updateItems.ts": $$$$$$$$$0,
  },
  "name": "nuvemshop",
  "baseUrl": import.meta.url,
};

export type Manifest = typeof manifest;

export default manifest;
