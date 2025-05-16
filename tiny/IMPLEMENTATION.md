# Tiny ERP App Implementation Guide

This document describes the current implementation status of the Tiny ERP app
and provides guidance for completing the implementation.

## Current Implementation Status

The following components have been implemented:

1. **Core Structure:**
   - `types.ts`: Contains TypeScript interfaces for API requests and responses
     (partially implemented)
   - `client.ts`: Defines the TinyClient interface for HTTP requests (partially
     implemented)
   - `mod.ts`: Exports the App function and defines the state and props
   - `manifest.gen.ts`: Placeholder for generated manifest

2. **Loaders:**
   - `loaders/info.ts`: Gets company account information
   - `loaders/categorias/todas.ts`: Lists all categories in tree format
   - `loaders/categorias-receita-despesa.ts`: Lists income/expense categories
     with filtering and pagination

3. **Actions:**
   - `actions/contas-pagar/criar.ts`: Creates a new payable account
   - `actions/contas-receber/atualizar.ts`: Updates an existing receivable
     account

## Next Steps

To complete the implementation, follow these steps:

1. **Complete Types:**
   - Expand `types.ts` to include all types from the OpenAPI specification

2. **Complete Client Interface:**
   - Add remaining API endpoints to the `TinyClient` interface in `client.ts`

3. **Implement Remaining Loaders and Actions:**
   - For each remaining endpoint in the README.md table:
     - For GET endpoints: Create a loader in the appropriate directory
     - For POST/PUT/DELETE endpoints: Create an action in the appropriate
       directory
   - Update the README.md table as you implement each endpoint

4. **Generate the Manifest:**
   - After implementing loaders and actions, run `deno task start` from the
     project root to generate the proper `manifest.gen.ts`

5. **Update Root deco.ts:**
   - Add `app("tiny")` to the apps array in the root `deco.ts` file

## Implementation Guidelines

When implementing loaders and actions, follow these patterns:

### Loader Pattern

```typescript
import { AppContext } from "../mod.ts";
import { ResponseType } from "../types.ts";

export interface Props {
  // Define props if needed
}

/**
 * @title Human-readable Title
 * @description Description of what this loader does
 */
const loader = async (
  props: Props, // or Record<string, never> if no props
  _req: Request,
  ctx: AppContext,
): Promise<ResponseType> => {
  try {
    const response = await ctx.api["HTTP_METHOD /path/to/endpoint"]({
      // path params if needed
    }, {
      // optional params like searchParams or body if needed
    });

    return await response.json();
  } catch (error) {
    console.error("Error message:", error);
    throw error;
  }
};

export default loader;
```

### Action Pattern

```typescript
import { AppContext } from "../mod.ts";
import { RequestType, ResponseType } from "../types.ts";

export interface Props extends RequestType {
  // Additional props if needed like path params
}

/**
 * @title Human-readable Title
 * @description Description of what this action does
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ResponseType> => {
  try {
    // Extract path params if needed
    const { pathParam, ...requestBody } = props;

    const response = await ctx.api["HTTP_METHOD /path/to/:pathParam"]({
      pathParam, // Path params
    }, {
      body: requestBody, // Request body
    });

    return await response.json();
  } catch (error) {
    console.error("Error message:", error);
    throw error;
  }
};

export default action;
```

## Directory Structure Recommendations

Organize loaders and actions in directories that match the API structure:

```
tiny/
├── actions/
│   ├── contas-pagar/
│   │   ├── criar.ts
│   │   └── ...
│   ├── contas-receber/
│   │   ├── atualizar.ts
│   │   └── ...
│   └── ...
├── loaders/
│   ├── categorias/
│   │   ├── todas.ts
│   │   └── ...
│   ├── categorias-receita-despesa.ts
│   ├── info.ts
│   └── ...
├── client.ts
├── mod.ts
├── types.ts
├── manifest.gen.ts
└── README.md
```

## Error Handling

Always include proper error handling in all loaders and actions:

1. Use try/catch blocks
2. Log errors with descriptive messages
3. Check response.ok for non-200 responses
4. Provide meaningful error messages when throwing errors

## Updating README Status

As you implement each endpoint, update the README.md table by changing the "Not
Implemented" value in the "Loader/Action Path" column to the relative path of
the implemented loader or action.

Initial PLan

Okay, I've reviewed the provided files (NewAppPrompt.md, tiny/README.md, and
tiny/tiny-api-v3.json). Based on these, here's a plan to implement the Tiny ERP
app: Phase 1: Project Setup & Core Client Implementation Understand the API
Structure: Thoroughly analyze tiny-api-v3.json to map out all API endpoints,
their HTTP methods, path parameters, query parameters, request bodies, and
response schemas. Pay close attention to the components.schemas section for
defining TypeScript types. Note the base server URL:
https://api.tiny.com.br/public-api/v3. Create tiny/types.ts (New File): Based on
the components.schemas in tiny-api-v3.json, define all necessary TypeScript
interfaces for request and response payloads. This will help in maintaining
clean and reusable type definitions. For example, ErrorDTO,
ListarArvoreCategoriasModelResponse, CriarContaPagarRequestModel, etc., will
have corresponding interfaces. Create tiny/client.ts: Import the types from
tiny/types.ts. Define the TinyClient interface following the structure outlined
in NewAppPrompt.md. Each key will be in the format "HTTP_METHOD
/path/to/endpoint". For example, "GET /categorias/todas" or "POST
/contas-pagar". Path parameters from the OpenAPI spec (e.g., {idContaPagar})
will be represented as :idContaPagar in the client interface keys. Define
response, body (for POST/PUT/PATCH), and searchParams (for GET requests with
query parameters) for each endpoint, using the interfaces defined in
tiny/types.ts. Create tiny/mod.ts: Import App, FnContext from @deco/deco,
createHttpClient from ../utils/http.ts (assuming standard deco project
structure), Manifest from ./manifest.gen.ts, and TinyClient from ./client.ts.
Props Definition: Define an interface Props for the app configuration. This
should include: account: (string) The Tiny account name/identifier. token:
(string | Secret) The API token for authentication (Bearer token as per OpenAPI
spec). baseUrl: (string, optional, default:
https://api.tiny.com.br/public-api/v3) State Definition: Define an interface
State extends Omit<Props, "token"> which will hold: api: An instance of
ReturnType<typeof createHttpClient<TinyClient>>. The account and other
non-sensitive props. App Function: Implement the export default function
App(props: Props): App<Manifest, State> function. Inside this function: Retrieve
the API token from props.token. Instantiate the api client using
createHttpClient<TinyClient>({...}). Set the base URL (either from props.baseUrl
or the default). Set the Authorization header using the Bearer ${_stringToken}.
Consider using fetchSafe if available. Construct and return the state object and
the manifest. Phase 2: Implementing Loaders and Actions Iterate Through
Endpoints: Go through each API endpoint defined in tiny-api-v3.json (and listed
in tiny/README.md). For each endpoint: Determine if it's a data retrieval (GET)
or a data manipulation (POST, PUT, DELETE) operation. Create Loader Files
(tiny/loaders/) for GET Endpoints: For each GET endpoint: Create a new .ts file
in the tiny/loaders/ directory. The filename should be descriptive of the
operation (e.g., listarCategorias.ts, obterContato.ts). You can create
subdirectories for better organization if needed (e.g.,
tiny/loaders/contatos/obter.ts). Import AppContext from ../mod.ts and any
necessary request/response types from ../types.ts. Define an interface Props for
any path parameters or query parameters required by the endpoint. If no
parameters are needed, this can be omitted. Write the async loader function:
Apply to IMPLEMENTATI... ; Update tiny/README.md: After creating each loader,
update the "Loader/Action Path" column for the corresponding row in the
README.md table with the relative path to the newly created file (e.g.,
loaders/info.ts). Create Action Files (tiny/actions/) for POST, PUT, DELETE
Endpoints: For each POST, PUT, or DELETE endpoint: Create a new .ts file in the
tiny/actions/ directory. Filename should be descriptive (e.g.,
criarContaPagar.ts, atualizarContato.ts). Import AppContext from ../mod.ts and
relevant types from ../types.ts. Define an interface Props for path parameters,
query parameters, and the request body. Write the async action function: Apply
to IMPLEMENTATI... ; Update tiny/README.md: After creating each action, update
the "Loader/Action Path" column for the corresponding row in the README.md table
with the relative path (e.g., actions/contasPagar/criar.ts). Phase 3: Manifest
and Finalization Create tiny/manifest.gen.ts: Create an initial manifest.gen.ts
file. It should import all created loaders and actions. It should export a
manifest object and a Manifest type, similar to the example in NewAppPrompt.md.
Apply to IMPLEMENTATI... ; Note: This file will be auto-generated/updated when
deno task start is run, but creating a placeholder helps with initial setup.
Update Root deco.ts: Add the tiny app to the apps array in the root deco.ts
file: Apply to IMPLEMENTATI... . Documentation and Next Steps for User: Clearly
state that the Loader/Action Path in tiny/README.md needs to be meticulously
updated as each function is implemented. Instruct to run deno task start in the
root of the deco/apps project after implementing loaders/actions to
automatically generate the manifest.gen.ts and check for type consistency.
Mention that error handling (e.g., try-catch blocks, checking response.ok)
within loaders/actions might be necessary for robust implementation but is not
explicitly detailed in this initial plan. Remind about the API authentication:
The token provided in mod.ts props will be used for Bearer authentication. This
plan provides a structured approach to implementing the Tiny ERP app. Each step
builds upon the previous ones, ensuring all components described in
NewAppPrompt.md are created and correctly linked. Shall I proceed with
generating the tiny/types.ts file as the first coding step, or would you like to
adjust any part of this plan?
