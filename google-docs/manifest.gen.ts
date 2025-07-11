// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $$$$$$$$$0 from "./actions/appendToDocument.ts";
import * as $$$$$$$$$1 from "./actions/createDocument.ts";
import * as $$$$$$$$$2 from "./actions/deleteDocument.ts";
import * as $$$$$$$$$3 from "./actions/duplicateDocument.ts";
import * as $$$$$$$$$4 from "./actions/oauth/callback.ts";
import * as $$$$$$$$$5 from "./actions/shareDocument.ts";
import * as $$$$$$$$$6 from "./actions/updateDocumentContent.ts";
import * as $$$0 from "./loaders/getDocument.ts";
import * as $$$1 from "./loaders/getDocumentMetadata.ts";
import * as $$$2 from "./loaders/listDocuments.ts";
import * as $$$3 from "./loaders/listSharedDocuments.ts";
import * as $$$4 from "./loaders/oauth/start.ts";
import * as $$$5 from "./loaders/oauth/whoami.ts";
import * as $$$6 from "./loaders/searchDocuments.ts";

const manifest = {
  "loaders": {
    "google-docs/loaders/getDocument.ts": $$$0,
    "google-docs/loaders/getDocumentMetadata.ts": $$$1,
    "google-docs/loaders/listDocuments.ts": $$$2,
    "google-docs/loaders/listSharedDocuments.ts": $$$3,
    "google-docs/loaders/oauth/start.ts": $$$4,
    "google-docs/loaders/oauth/whoami.ts": $$$5,
    "google-docs/loaders/searchDocuments.ts": $$$6,
  },
  "actions": {
    "google-docs/actions/appendToDocument.ts": $$$$$$$$$0,
    "google-docs/actions/createDocument.ts": $$$$$$$$$1,
    "google-docs/actions/deleteDocument.ts": $$$$$$$$$2,
    "google-docs/actions/duplicateDocument.ts": $$$$$$$$$3,
    "google-docs/actions/oauth/callback.ts": $$$$$$$$$4,
    "google-docs/actions/shareDocument.ts": $$$$$$$$$5,
    "google-docs/actions/updateDocumentContent.ts": $$$$$$$$$6,
  },
  "name": "google-docs",
  "baseUrl": import.meta.url,
};

export type Manifest = typeof manifest;

export default manifest;
