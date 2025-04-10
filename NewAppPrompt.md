# Prompt to Create a New App

> Use this prompt in an AI editor (Cursor, Windsurf) to create a new app

A deco app allows a service API to be exposed using Typescript functions. After
a service it wrapped in an app, it can be used

- As a data source in deco CMS
- As a MCP server in deco.chat

For the AI to create the necessary typings and functions, you need to provide a
data source for the API documentation. It can be the plain text of an API docs
or an OpenAPI specification.

##### PASTE HERE INSTRUCTIONS

## Instructions

A new app should be placed inside a folder on the root of this repo with the app
name. For example, if we're creating an app for Figma, the app files will be on
`figma/`

### client.ts

The client.ts is one of the central pieces of an app. It defines:

- Typings for the data entities that the API accepts/returns.
- All API methods with typed input and output

Example: Read `grain/client.ts` as example implementation of a client.

### mod.ts

The mod.ts is the entrypoint for the app and it declares the **app
configuration**, like API token or account name. This is information that is
required for all methods in the API and it might be better if the user informs
only once (when installing the app).

It also instantiates the client or any other SDK/information that will be passed
as context for every action and loader when executed

Example: Read `grain/mod.ts` as example implementation of a client.

### Actions and Loaders

An app is used, after installed, by calling its actions and loaders.

Actions and Loaders are Typescript functions that abstract the API methods of
the service being wrapped.

Loaders are used to retrieve data.

Actions are used when you save or update data in the external services.

To declare an action or loader, it's just needed to create a `{actionName}.ts`
inside `{appFolder}/actions/` or `{loaderName}.ts` inside
`{appFolder}/loaders/`. You can use intermediary folders for organization.

Examples: Read `grain/actions/hooks/create.ts` for example of an action and
`grain/loaders/recordings/get.ts` for example of an loader.

### deco.ts

In root `deco.ts`, add a new entry for the newly created app.

### Manifest

In every app folder there's also a `manifest.gen.ts` that exports all actions
and loaders from an app. You don't need to worry about this file because it will
be automatically generated when running `deno task start` in the root folder.
