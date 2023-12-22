import { Resolvable } from "deco/engine/core/resolver.ts";
import { Release } from "deco/engine/releases/provider.ts";
import { context } from "deco/live.ts";
import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import type { Secret } from "../website/loaders/secret.ts";
import workflows from "../workflows/mod.ts";
import {
  EventPayloadMap,
  k8s,
  Octokit,
  WebhookEventName,
  Webhooks,
} from "./deps.ts";
import { FsBlockStorage } from "./fsStorage.ts";
import { prEventHandler } from "./github/pr.ts";
import { pushEventHandler } from "./github/push.ts";
import { SiteState } from "./loaders/k8s/siteState.ts";
import { State as Resolvables } from "./loaders/state.ts";
import manifest, { Manifest as AppManifest } from "./manifest.gen.ts";

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
  workloadNamespace: string;
  kc: k8s.KubeConfig;
  defaultSiteState: Partial<SiteState>;
  controlPlaneDomain: string;
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
  resolvables: Resolvables;
  github?: GithubProps;
  workloadNamespace?: string;
  defaultSiteState?: Partial<SiteState>;
  controlPlaneDomain?: string;
}

/**
 * @title Admin
 */
export default function App(
  {
    resolvables,
    github,
    workloadNamespace = "deco-sites",
    defaultSiteState,
    controlPlaneDomain = "decocdn.com",
  }: Props,
): App<AppManifest, State, [ReturnType<typeof workflows>]> {
  const kc = new k8s.KubeConfig();
  const workflowsApp = workflows({});
  if (!context.play) {
    try {
      context.isDeploy ? kc.loadFromCluster() : kc.loadFromDefault();
    } catch (err) {
      console.error("couldn't not load from kuberentes state", err);
    }
  }
  const githubAPIToken = github?.octokitAPIToken?.get?.() ??
    Deno.env.get("OCTOKIT_TOKEN");
  const githubWebhookSecret = github?.webhookSecret?.get?.() ??
    Deno.env.get("GITHUB_WEBHOOK_SECRET");
  return {
    manifest,
    state: {
      kc,
      githubWebhookSecret,
      controlPlaneDomain,
      defaultSiteState: defaultSiteState ?? {
        scaling: {
          preview: {
            maxScale: 3,
            initialScale: 0,
            minScale: 0,
            retentionPeriod: "0s",
          },
          production: {
            maxScale: 100,
            initialScale: 3,
            minScale: 0,
            retentionPeriod: "5m",
          },
        },
      },
      workloadNamespace,
      githubEventListeners: [
        ...github?.eventListeners ?? [],
        pushEventHandler as GithubEventListener,
        prEventHandler as GithubEventListener,
      ],
      storage: new FsBlockStorage(),
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
    dependencies: [workflowsApp],
  };
}

export type AppContext = AC<ReturnType<typeof App>>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;
