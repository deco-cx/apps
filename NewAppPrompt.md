# Prompt to Create a New App

> Use this prompt in an AI editor (Cursor, Windsurf) to create a new app

**Important:** Run this alongside information about the app you're creating, be
it a documentation or OpenAPI specification.

A deco app allows a service API to be exposed using Typescript functions. After
a service it wrapped in an app, it can be used

- As a data source in deco CMS
- As a MCP server in deco.chat

For the AI to create the necessary typings and functions, you need to provide a
data source for the API documentation. It can be the plain text of an API docs
or an OpenAPI specification.

## Instructions

A new app should be placed inside a folder on the root of this repo with the app
name. For example, if we're creating an app for Figma, the app files will be on
`figma/`

### client.ts

The client.ts is one of the central pieces of an app. It defines:

- Typings for the data entities that the API accepts/returns.
- All API methods with typed input and output

The client interface follows a specific pattern that works with the
`createHttpClient` utility. Here's a detailed example:

```typescript
// First, define your data types/interfaces
export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
}

// Then define your client interface
// The key format must be: "HTTP_METHOD /path/to/endpoint"
// Parameters in the URL path must be prefixed with : (e.g. :username)
// Optional parameters must end with ? (e.g. :filter?)
export interface GithubClient {
  // Simple GET request with URL parameters
  "GET /users/:username": {
    response: GithubUser; // Type of the response
  };

  // POST request with body and URL parameters
  "POST /users/:username": {
    response: GithubUser;
    body: {
      filter: string;
    };
  };

  // GET request with query parameters (searchParams)
  "GET /search/users": {
    response: { users: GithubUser[] };
    searchParams: {
      q: string;
      page?: number;
      per_page?: number;
    };
  };

  // POST with both URL params, query params and body
  "POST /repos/:owner/:repo/issues": {
    response: { id: number };
    body: {
      title: string;
      body: string;
    };
    searchParams: {
      assignee?: string;
      labels?: string[];
    };
  };
}
```

Key points about the client interface:

1. **HTTP Methods**: Must be one of: GET, PUT, POST, DELETE, PATCH, HEAD

2. **URL Parameters**:
   - Required parameters: `:paramName`
   - Optional parameters: `:paramName?`
   - Wildcard parameters: `*` or `*paramName`

3. **Response Type**:
   - Always defined in the `response` property
   - Can be any TypeScript type/interface
   - Optional if the endpoint doesn't return data

4. **Request Body**:
   - Defined in the `body` property
   - Required for POST/PUT/PATCH methods
   - Must be a JSON-serializable object

5. **Query Parameters**:
   - Defined in the `searchParams` property
   - All parameters are optional by default
   - Can be primitive types or arrays

Example usage with the client:

```typescript
const api = createHttpClient<GithubClient>({
  base: "https://api.github.com",
  headers: new Headers({
    "Authorization": `Bearer ${token}`,
  }),
});

// Using URL parameters
const user = await api["GET /users/:username"]({
  username: "octocat",
});

// Using query parameters
const search = await api["GET /search/users"]({
  q: "john",
  page: 1,
  per_page: 10,
});

// Using body and URL parameters
const issue = await api["POST /repos/:owner/:repo/issues"](
  {
    owner: "octocat",
    repo: "Hello-World",
  },
  {
    body: {
      title: "Found a bug",
      body: "This is a bug report",
    },
  },
);
```

The client interface is used by the `createHttpClient` utility to:

- Type-check URL parameters
- Type-check request bodies
- Type-check query parameters
- Provide type-safe responses
- Handle URL construction
- Handle JSON serialization
- Manage headers and authentication

### mod.ts

The mod.ts is the entrypoint for the app and it declares the **app
configuration**, like API token or account name. This is information that is
required for all methods in the API and it might be better if the user informs
only once (when installing the app).

It also instantiates the client or any other SDK/information that will be passed
as context for every action and loader when executed. It uses the

Example:

```typescript
import type { App, FnContext } from "@deco/deco";
import { fetchSafe } from "../utils/fetch.ts";
import { createHttpClient } from "../utils/http.ts";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { ClientInterfaceExample } from "./client.ts";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Account Name
   * @description erploja2 etc
   */
  account: string;

  /**
   * @title API token
   * @description The token for accessing your API
   */
  token?: string | Secret;
}

// Here we define the state of the app
// You choose what to put in the state
export interface State extends Omit<Props, "token"> {
  api: ReturnType<typeof createHttpClient<ClientInterfaceExample>>;
}

/**
 * @name App Template
 * @description This is an template of an app to be used as a reference.
 * @category Developer Tools
 * @logo https://
 */
export default function App(props: Props): App<Manifest, State> {
  const { token, account: _account } = props;

  const _stringToken = typeof token === "string" ? token : token?.get?.() ?? "";

  const api = createHttpClient<ClientInterfaceExample>({
    base: `https://api.github.com/users/guitavano`,
    headers: new Headers({ "Authorization": `Bearer ${_stringToken}` }),
    fetcher: fetchSafe,
  });

  // it is the state of the app, all data
  // here will be available in the context of
  // loaders, actions and workflows
  const state = { ...props, api };

  return {
    state,
    manifest,
  };
}
```

### Actions and Loaders

An app is used, after installed, by calling its actions and loaders.

Actions and Loaders are Typescript functions that abstract the API methods of
the service being wrapped.

Loaders are used to retrieve data.

Actions are used when you save or update data in the external services.

To declare an action or loader, it's just needed to create a `{actionName}.ts`
inside `{appFolder}/actions/` or `{loaderName}.ts` inside
`{appFolder}/loaders/`. You can use intermediary folders for organization.

Examples:

### Loader Example

```typescript
import { AppContext } from "../mod.ts";
import { GithubUser } from "../utils/types.ts";

interface Props {
  username: string;
}

/**
 * @title This name will appear on the admin
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GithubUser> => {
  const response = await ctx.api[`GET /users/:username`]({
    username: props.username,
  });

  const result = await response.json();

  return result;
};

export default loader;
```

### Action Example

```typescript
import { AppContext } from "../mod.ts";
import { GithubUser } from "../utils/types.ts";

interface Props {
  username: string;
}

/**
 * @title This name will appear on the admin
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GithubUser> => {
  const response = await ctx.api[`POST /users/:username`]({
    username: props.username,
  }, { body: { filter: "filter" } });

  const result = await response.json();

  return result;
};

export default action;
```

If a method has no props, just don't type the Props. Don't export an empty
interface.

### deco.ts

In root `deco.ts`, add a new entry for the newly created app.

```
const config = {
  apps: [
    app("deno"),
    app("figma"),
    app("unsplash"),
    app("reflect"),
    app("grain"),
    app("slack"),
```

### Manifest

In every app folder there's also a `manifest.gen.ts` that exports all actions
and loaders from an app. You don't need to worry about this file because it will
be automatically generated when running `deno task start` in the root folder.

Generate a first version so the app doesn't break: Example

```typescript
// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $$$$$$$$$0 from "./actions/myAction.ts";
import * as $$$0 from "./loaders/myLoader.ts";
import * as $$$$$$0 from "./sections/mySection.tsx";

const manifest = {
  "loaders": {
    "app-template/loaders/myLoader.ts": $$$0,
  },
  "sections": {
    "app-template/sections/mySection.tsx": $$$$$$0,
  },
  "actions": {
    "app-template/actions/myAction.ts": $$$$$$$$$0,
  },
  "name": "app-template",
  "baseUrl": import.meta.url,
};

export type Manifest = typeof manifest;

export default manifest;
```

## Manifest Gen

In the end, run `deno task start` to regenerate the manifest.
