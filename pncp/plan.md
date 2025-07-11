# PNCP App Development Plan (v2)

This document outlines the steps to create the PNCP (Portal Nacional de
Contratações Públicas) app based on the official OpenAPI specification
(`docs.json`). This version replaces the initial plan, which was based on a
simpler, undocumented search endpoint.

The new API requires authentication and provides a much richer set of features.

### 1. Update `pncp/client.ts`

- **Goal:** Define the complete client interface and all necessary data types
  based on `docs.json`.
- **Tasks:**
  - Remove the old `Compra` and `SearchResults` interfaces.
  - Add new interfaces for all DTOs defined in `components/schemas` of
    `docs.json` (e.g., `RecuperarCompraDTO`,
    `PaginaRetornoRecuperarContratoDTO`, `RecuperarOrgaoEntidadeDTO`).
  - Update the `PNCPClient` interface to include the new API endpoints:
    - `GET /v1/orgaos/{cnpj}/compras/{ano}/{sequencial}`
    - `GET /v1/contratacoes/publicacao`
    - `GET /v1/contratacoes/proposta`
    - `GET /v1/contratos`
    - `GET /v1/atas`
    - And other relevant endpoints from the specification.
  - Ensure all path parameters, query parameters, and response types match the
    specification.

### 2. Update `pncp/mod.ts`

- **Goal:** Configure the app to handle the new API base path and
  authentication.
- **Tasks:**
  - Add a `token` property of type `Secret` to the `Props` interface to securely
    store the API authentication token.
  - Update the `createHttpClient` instantiation:
    - Change the `base` URL to `https://pncp.gov.br/api/consulta`.
    - Add the `Authorization` header to pass the bearer token with each request.
  - Update the `State` interface accordingly.

### 3. Create New Loaders

- **Goal:** Expose the new API endpoints as type-safe loaders.
- **Tasks:**
  - Delete the old `pncp/loaders/search.ts`.
  - Create `pncp/loaders/getCompra.ts`: Fetches a single public procurement by
    CNPJ, year, and sequence number.
  - Create `pncp/loaders/listContratacoesByPublicacao.ts`: Searches for
    procurements by publication date. This will be the main search loader.
  - Create `pncp/loaders/listContratacoesByProposta.ts`: Searches for
    procurements with open proposals.
  - Create `pncp/loaders/listContratos.ts`: Fetches contracts by publication
    date.
  - Create `pncp/loaders/listAtas.ts`: Fetches price registration records
    (`atas`) by validity period.

### 4. Update `pncp/manifest.gen.ts`

- **Goal:** Update the manifest to reflect the new set of loaders.
- **Tasks:**
  - Remove the entry for the old `search.ts` loader.
  - Add entries for all the new loaders created in the previous step.

### 5. Update `deco.ts`

- **Goal:** Ensure the app is correctly registered.
- **Status:** **Done.** No changes are needed here.

### 6. Generate Final Manifest

- **Goal:** Automatically generate the final, correct manifest.
- **Tasks:**
  - Run `deno task start` after all files have been created and updated. This
    will validate all imports and generate the final `manifest.gen.ts`.
