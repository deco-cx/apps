# Deno Deploy for deco.cx

This app integrates Deno Deploy with deco.cx, allowing you to interact with the Deno Deploy API directly from your deco apps.

## Setup

To use this app, you need to install it in your deco project:

1. Add the app to your import map in `deno.json`:

```json
{
  "imports": {
    "deno-deploy/": "https://cdn.jsdelivr.net/gh/deco-cx/apps/deno-deploy/"
  }
}
```

2. Add the app to your `deco.ts` file:

```ts
import { App } from "deco/mod.ts";

export default {
  apps: [
    App({
      name: "deno-deploy",
    }),
  ],
};
```

3. Configure the app in the deco admin with your Deno Deploy API token.

## API Token

To use this app, you need a Deno Deploy API token. You can generate one in your Deno Deploy dashboard:

1. Go to [dash.deno.com](https://dash.deno.com)
2. Log in with your account
3. Click on your profile name in the upper right corner
4. Select "Access Tokens"
5. Create a new token with appropriate permissions

## Loaders

The app includes several loaders to fetch data from the Deno Deploy API:

- `organization` - Get organization details
- `projects` - List projects of an organization
- `project` - Get project details
- `deployments` - List deployments of a project
- `deployment` - Get deployment details
- `buildLogs` - Get build logs of a deployment
- `kvDatabases` - List KV databases

## Actions

The app includes several actions to modify data in the Deno Deploy API:

- `createProject` - Create a new project
- `createDeployment` - Create a new deployment
- `redeployDeployment` - Redeploy an existing deployment
- `deleteDeployment` - Delete a deployment
- `createKvDatabase` - Create a new KV database

## Examples

### Fetch organization details

```ts
import { useLoader } from "deco/hooks/useLoader.ts";
import { Organization } from "deno-deploy/loaders/organization.ts";

export default function Page() {
  const { data } = useLoader<Organization>("/organization", {
    organizationId: "your-organization-id",
  });

  return (
    <div>
      <h1>Organization: {data?.name}</h1>
    </div>
  );
}
```

### Create a new project

```ts
import { useCallback } from "preact/hooks";
import { useUI } from "deco/hooks/useUI.ts";

export default function Page() {
  const { displayAlert } = useUI();

  const createProject = useCallback(async () => {
    try {
      const response = await fetch("/live/actions/deno-deploy/createProject.ts", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "your-organization-id",
          name: "my-new-project",
          description: "My awesome project",
        }),
      });
      
      if (response.ok) {
        const project = await response.json();
        displayAlert({ message: `Created project: ${project.name}` });
      }
    } catch (error) {
      displayAlert({ message: `Error: ${error.message}`, type: "error" });
    }
  }, []);

  return (
    <button onClick={createProject}>Create Project</button>
  );
}
```

## More Information

For more details about the Deno Deploy API, visit the [official documentation](https://docs.deno.com/deploy/api). 