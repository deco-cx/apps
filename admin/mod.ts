import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { Manifest as AIAssistantManifest } from "../ai-assistants/manifest.gen.ts";
import { Manifest as OpenAIManifest } from "../openai/manifest.gen.ts";
import k8s, { Props as K8sProps } from "../platforms/kubernetes/mod.ts";
import subhosting, {
  Props as SubhostingProps,
} from "../platforms/subhosting/mod.ts";
import type { Secret } from "../website/loaders/secret.ts";
import { PlatformName } from "./actions/sites/create.ts";
import {
  EventPayloadMap,
  Octokit,
  WebhookEventName,
  Webhooks,
} from "./deps.ts";
import { prEventHandler } from "./github/pr.ts";
import { prCloseEventHandler } from "./github/prClose.ts";
import { pushEventHandler } from "./github/push.ts";
import manifest, { Manifest as AppManifest } from "./manifest.gen.ts";

export const ANONYMOUS = "Anonymous";

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
  octokit: Octokit;
  webhooks?: Webhooks;
  githubEventListeners: GithubEventListener[];
  githubWebhookSecret?: string;
  platformAssignments: Record<string, PlatformName | undefined>;
}

export interface GithubProps {
  webhookSecret?: Secret;
  octokitAPIToken?: Secret;
  eventListeners?: GithubEventListener[];
}

/**
 * @format dynamic-options
 * @options deco-sites/admin/loaders/sites/list.ts
 */
export type SiteName = string;
/**
 * @title {{{site}}} - {{{platform}}}
 */
export interface PlatformAssignment {
  site: SiteName;
  platform: PlatformName;
}

export interface Props {
  github?: GithubProps;
  /**
   * @default null
   */
  kubernetes?: K8sProps | null;
  /**
   * @default null
   */
  subhosting?: SubhostingProps | null;
  /** @description property used at deco admin  */
  platformAssignments?: PlatformAssignment[];
}

/**
 * @title Admin
 */
export default function App(
  {
    github,
    kubernetes,
    subhosting: subhostingProps,
    platformAssignments = [],
  }: Props,
): App<
  AppManifest,
  State,
  [ReturnType<typeof k8s>, ReturnType<typeof subhosting>]
> {
  const k8sApp = k8s(kubernetes ?? {});
  const subhostingApp = subhosting(subhostingProps ?? {});
  const githubAPIToken = github?.octokitAPIToken?.get?.() ??
    Deno.env.get("OCTOKIT_TOKEN");
  const githubWebhookSecret = github?.webhookSecret?.get?.() ??
    Deno.env.get("GITHUB_WEBHOOK_SECRET");
  return {
    manifest,
    state: {
      platformAssignments: platformAssignments.reduce(
        (assignments, { site, platform }) => {
          return { ...assignments, [site]: platform };
        },
        {} as Record<string, PlatformName | undefined>,
      ),
      githubWebhookSecret,
      githubEventListeners: [
        ...github?.eventListeners ?? [],
        pushEventHandler as GithubEventListener,
        prEventHandler as GithubEventListener,
        prCloseEventHandler as GithubEventListener,
      ],
      octokit: new Octokit({
        auth: githubAPIToken,
      }),
      webhooks: githubWebhookSecret
        ? new Webhooks({
          secret: githubWebhookSecret,
        })
        : undefined,
    },
    dependencies: [k8sApp, subhostingApp],
  };
}

export type AppContext = AC<
  & Omit<App<AIAssistantManifest>, "dependencies">
  & Omit<App<OpenAIManifest>, "dependencies">
  & ReturnType<typeof App>
>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;
