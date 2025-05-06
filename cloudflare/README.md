# Cloudflare Integration for Deco

This app provides integration with the Cloudflare API, allowing you to manage and interact with your Cloudflare assets directly from Deco.

## Features

- List Workers scripts in your Cloudflare account
- Get content from a specific Worker script
- Deploy or update Worker scripts with full configuration
- Delete Worker scripts
- List Cloudflare accounts you have access to

## Authentication

The app supports two authentication methods:

1. **API Token** (recommended): Using a Cloudflare API token with the necessary permissions
2. **Email + API Key**: Using your Cloudflare account email and API key

## Required Permissions

For the API token authentication method, ensure your token has the following permissions:

- Workers Scripts:Read
- Workers Scripts:Edit
- Account:Read

## Setup

When installing the app, you'll need to provide:

- **Account ID**: Your Cloudflare account ID
- **API Token** or **Email + API Key**: Your authentication credentials

## Example Usage

### List Workers

```typescript
const workers = await invoke.cloudflare.loaders.listWorkers({});
console.log(workers);
```

### Get Worker Script Content

```typescript
const scriptContent = await invoke.cloudflare.loaders.getScriptContent({
  scriptName: "my-worker"
});
console.log(scriptContent);
```

### Deploy a New Worker

```typescript
const deployResult = await invoke.cloudflare.actions.deployWorker({
  scriptName: "my-worker",
  scriptContent: `
    export default {
      async fetch(request, env, ctx) {
        return new Response('Hello from Deco!');
      }
    };
  `,
  moduleType: "esm",
  compatibilityDate: "2024-01-01",
  bindings: [
    {
      type: "kv_namespace",
      name: "MY_KV",
      namespace_id: "abcdef123456"
    }
  ]
});

console.log(`Worker deployed at: ${deployResult.domain}`);
```

### Update Worker with Advanced Configuration

```typescript
const updateResult = await invoke.cloudflare.actions.putScriptContent({
  scriptName: "my-worker",
  scriptContent: `
    export default {
      async fetch(request, env, ctx) {
        return new Response('Updated Worker!');
      }
    };
  `,
  moduleType: "esm",
  compatibilityDate: "2024-01-01",
  compatibilityFlags: ["nodejs_compat"],
  bindings: [
    {
      type: "r2_bucket",
      name: "MY_BUCKET",
      bucket_name: "my-storage-bucket"
    }
  ],
  noObservability: false
});

console.log(`Worker updated at: ${updateResult.domain}`);
```

### Delete a Worker

```typescript
const deleteResult = await invoke.cloudflare.actions.deleteWorker({
  scriptName: "my-worker"
});

console.log(deleteResult.message);
```

### List Accounts

```typescript
const accounts = await invoke.cloudflare.loaders.listAccounts({});
console.log(accounts);
```

## Worker Bindings

The app supports all types of Cloudflare Worker bindings:

- KV Namespaces
- R2 Buckets
- D1 Databases
- Durable Objects
- Service bindings
- Queue bindings
- Analytics Engine datasets

## Workers.dev Domains

By default, when deploying a Worker, it will be available at `<script-name>.<account-id>.workers.dev`. You can disable this by setting `skipWorkersDev: true` in the deployment options. 