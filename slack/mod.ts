import type { App, FnContext } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SlackClient } from "./client.ts";
import { Secret } from "../website/loaders/secret.ts";

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
}

export interface State extends Props {
  slack: SlackClient;
}

export type AppContext = FnContext<State, Manifest>;

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
