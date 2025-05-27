import type { App, FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import { Secret } from "../website/loaders/secret.ts";
import { SlackClient } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Callbacks } from "../mcp/bindings.ts";

export interface SlackWebhookPayload {
  event_id: string;
  event: {
    text: string;
    team: string;
    channel: string;
  };
}

export interface Props {
  /**
   * @description Slack Bot Token for authentication
   */
  botToken: string | Secret;
  /**
   * @description Slack Team/Workspace ID
   */
  teamId: string;

  /**
   * @description An url that new messages will be sent to
   */
  webhookUrl?: string;

  /**
   * @hide true
   */
  callbacks?: Callbacks;
}

export interface State extends Props {
  slack: SlackClient;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @name Slack
 * @title Slack
 * @description Send messages and interact with Slack channels
 * @logo https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/306_Slack_logo-512.png
 */
export default function App(props: Props): App<Manifest, State> {
  const slack = new SlackClient(
    typeof props.botToken === "string" ? props.botToken : props.botToken.get()!,
  );

  return {
    state: {
      ...props,
      slack,
    },
    manifest,
  };
}

// Re-export types from client for convenience
export * from "./client.ts";
