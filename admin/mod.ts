import { Resolvable } from "deco/engine/core/resolver.ts";
import { Release } from "deco/engine/releases/provider.ts";
import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import k8s, { Props as K8sProps } from "../platforms/kubernetes/mod.ts";
import type { Secret } from "../website/loaders/secret.ts";
import {
  EventPayloadMap,
  Octokit,
  WebhookEventName,
  Webhooks,
} from "./deps.ts";
import { storage } from "./fsStorage.ts";
import { prEventHandler } from "./github/pr.ts";
import { pushEventHandler } from "./github/push.ts";
import { State as Resolvables } from "./loaders/state.ts";
import manifest, { Manifest as AppManifest } from "./manifest.gen.ts";
import { Manifest as AIAssistantManifest } from "../ai-assistants/manifest.gen.ts";
import { Manifest as OpenAIManifest } from "../openai/manifest.gen.ts";

export const ANONYMOUS = "Anonymous";
export interface BlockStore extends Release {
  patch(
    resolvables: Record<string, Resolvable>,
  ): Promise<Record<string, Resolvable>>;
  update(resolvables: Record<string, Resolvable>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface GithubEventListener<
  TEvents extends WebhookEventName = WebhookEventName,
> {
  events?: TEvents[];
  handle: (
    event: EventPayloadMap[TEvents],
    req: Request,
    ctx: AppContext,
  ) => Promise<void>;
}

export interface State {
  storage: BlockStore;
  octokit: Octokit;
  webhooks?: Webhooks;
  githubEventListeners: GithubEventListener[];
  githubWebhookSecret?: string;
}

export interface BlockState<TBlock = unknown> {
  id: string;
  site: string;
  createdAt: Date;
  resolveType: string;
  value: TBlock | null;
  createdBy: string;
  revision: string;
}

export interface BlockMetadata {
  id: string;
  revision?: string;
  archived: boolean;
  type: string; // e.g: "account" | "matcher" | "page" | "section" | "loader";
  module: string; // e.g: VTEXAccount.ts, LivePage.ts, Header.tsx
  usedBy: Array<Pick<BlockMetadata, "id">>;
  lastUpdated: {
    at: number;
    byEmail: string;
    byUserId: string;
  };
  data: Resolvable;
}

export interface GithubProps {
  webhookSecret?: Secret;
  octokitAPIToken?: Secret;
  eventListeners?: GithubEventListener[];
}

export interface Props {
  resolvables?: Resolvables;
  github?: GithubProps;
  kubernetes: K8sProps;
}

/**
 * @title Admin
 */
export default function App(
  {
    resolvables,
    github,
    kubernetes,
  }: Props,
): App<
  AppManifest,
  State,
  [ReturnType<typeof k8s>]
> {
  const k8sApp = k8s(kubernetes ?? {});
  const githubAPIToken = github?.octokitAPIToken?.get?.() ??
    Deno.env.get("OCTOKIT_TOKEN");
  const githubWebhookSecret = github?.webhookSecret?.get?.() ??
    Deno.env.get("GITHUB_WEBHOOK_SECRET");
  return {
    manifest,
    state: {
      githubWebhookSecret,
      githubEventListeners: [
        ...github?.eventListeners ?? [],
        pushEventHandler as GithubEventListener,
        prEventHandler as GithubEventListener,
      ],
      storage,
      octokit: new Octokit({
        auth: githubAPIToken,
      }),
      webhooks: githubWebhookSecret
        ? new Webhooks({
          secret: githubWebhookSecret,
        })
        : undefined,
    },
    resolvables,
    dependencies: [k8sApp],
  };
}

export type AppContext = AC<
  & Omit<App<AIAssistantManifest>, "dependencies">
  & Omit<App<OpenAIManifest>, "dependencies">
  & ReturnType<typeof App>
>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;
