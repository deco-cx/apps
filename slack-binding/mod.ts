import type { App, FnContext } from "@deco/deco";
import { createHttpClient } from "../utils/http.ts";
import type { SlackClient } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  /**
   * @title Webhook URL
   * @description The real webhook URL to forward Slack events to
   */
  webhookUrl: string;
  /**
   * @title Slack Bot Token
   * @description The bot token for Slack API access
   * @default (from env SLACK_BOT_TOKEN)
   */
  botToken?: string;
}

export interface State extends Props {
  api: ReturnType<typeof createHttpClient<SlackClient>>;
  supabase: SupabaseClient;
  botToken: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY") as string;
const BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN") as string;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_KEY must be set in environment variables",
  );
}

if (!BOT_TOKEN) {
  throw new Error("SLACK_BOT_TOKEN must be set in environment variables");
}

/**
 * @name SlackBinding
 * @title SlackBinding
 * @description Forward Slack events to a webhook
 * @logo https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/306_Slack_logo-512.png
 */
export default function App(props: Props): App<Manifest, State> {
  const api = createHttpClient<SlackClient>({
    base: props.webhookUrl,
  });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  return {
    state: { ...props, api, supabase, botToken: BOT_TOKEN },
    manifest,
  };
}
