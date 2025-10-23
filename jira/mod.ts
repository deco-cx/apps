import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { JiraClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

export interface Props {
  /**
   * @description Jira instance base URL (e.g., https://your-domain.atlassian.net)
   */
  baseUrl: string;
  /**
   * @description Jira user email for API authentication
   */
  email: string;
  /**
   * @description Jira API token (use a Secret for security)
   */
  apiToken: string | Secret;
}

export interface State extends Props {
  jira: JiraClient;
}

export type AppContext = FnContext<State, Manifest>;

/**
 * @appName jira
 * @title Jira
 * @description Create and update issues and comments in your Jira projects.
 * @logo https://assets.decocache.com/mcp/7bae17a9-cfdb-4969-99ca-436b7a4dcf40/Jira.svg
 */
export default function App(props: Props): App<Manifest, State> {
  const jira = new JiraClient({
    baseUrl: props.baseUrl,
    email: props.email,
    apiToken: typeof props.apiToken === "string"
      ? props.apiToken
      : props.apiToken.get()!,
  });

  return {
    state: {
      ...props,
      jira,
    },
    manifest,
  };
}

export * from "./client.ts";
