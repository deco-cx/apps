// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $$$$$$$$$0 from "./actions/addFormula.ts";
import * as $$$$$$$$$1 from "./actions/batchUpdateValues.ts";
import * as $$$$$$$$$2 from "./actions/copySheet.ts";
import * as $$$$$$$$$3 from "./actions/createSheet.ts";
import * as $$$$$$$$$4 from "./actions/createSpreadsheet.ts";
import * as $$$$$$$$$5 from "./actions/deleteSheet.ts";
import * as $$$$$$$$$6 from "./actions/oauth/callback.ts";
import * as $$$$$$$$$7 from "./actions/updateValues.ts";
import * as $$$0 from "./loaders/getBatchValues.ts";
import * as $$$1 from "./loaders/getEmptyColumn.ts";
import * as $$$2 from "./loaders/getSheetHeaders.ts";
import * as $$$3 from "./loaders/getSpreadsheet.ts";
import * as $$$4 from "./loaders/getValues.ts";
import * as $$$5 from "./loaders/oauth/start.ts";
import * as $$$6 from "./loaders/oauth/whoami.ts";
import * as $$$7 from "./loaders/query.ts";

const manifest = {
  "loaders": {
    "google-sheets/loaders/getBatchValues.ts": $$$0,
    "google-sheets/loaders/getEmptyColumn.ts": $$$1,
    "google-sheets/loaders/getSheetHeaders.ts": $$$2,
    "google-sheets/loaders/getSpreadsheet.ts": $$$3,
    "google-sheets/loaders/getValues.ts": $$$4,
    "google-sheets/loaders/oauth/start.ts": $$$5,
    "google-sheets/loaders/oauth/whoami.ts": $$$6,
    "google-sheets/loaders/query.ts": $$$7,
  },
  "actions": {
    "google-sheets/actions/addFormula.ts": $$$$$$$$$0,
    "google-sheets/actions/batchUpdateValues.ts": $$$$$$$$$1,
    "google-sheets/actions/copySheet.ts": $$$$$$$$$2,
    "google-sheets/actions/createSheet.ts": $$$$$$$$$3,
    "google-sheets/actions/createSpreadsheet.ts": $$$$$$$$$4,
    "google-sheets/actions/deleteSheet.ts": $$$$$$$$$5,
    "google-sheets/actions/oauth/callback.ts": $$$$$$$$$6,
    "google-sheets/actions/updateValues.ts": $$$$$$$$$7,
  },
  "name": "google-sheets",
  "baseUrl": import.meta.url,
};

export type Manifest = typeof manifest;

export default manifest;
