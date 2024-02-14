import { Context } from "deco/deco.ts";
import { Resolvable } from "deco/engine/core/resolver.ts";
import { Release } from "deco/engine/releases/provider.ts";
import type { App, AppContext as AC, ManifestOf } from "deco/mod.ts";
import { Manifest as AIAssistantManifest } from "../ai-assistants/manifest.gen.ts";
import { Manifest as OpenAIManifest } from "../openai/manifest.gen.ts";
import k8s, { Props as K8sProps } from "../platforms/kubernetes/mod.ts";
import subhosting, {
  Props as SubhostingProps,
} from "../platforms/subhosting/mod.ts";
import type { Secret } from "../website/loaders/secret.ts";
import {
  EventPayloadMap,
  Octokit,
  WebhookEventName,
  Webhooks,
} from "./deps.ts";
import { prEventHandler } from "./github/pr.ts";
import { pushEventHandler } from "./github/push.ts";
import { State as Resolvables } from "./loaders/state.ts";
import manifest, { Manifest as AppManifest } from "./manifest.gen.ts";
import { Decofile, IRepository, Repository } from "./storage/mod.ts";

export const ANONYMOUS = "Anonymous";

type SignalStringified<Data> = { __signal: Data };
// deno-lint-ignore no-explicit-any
type Layout = any;
// deno-lint-ignore no-explicit-any
type Tab = any;

export interface Workspace {
  name: string;
  layout: Layout[];
  tabs: Record<string, Tab>;
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
export interface StorageProvider {
  getRepository(site: string): Promise<IRepository>;
  useRepository(
    site: string,
    f: (repo: IRepository) => Promise<IRepository>,
  ): Promise<IRepository>;
  patchDecofile(
    site: string,
    f: (decofile: Decofile) => Promise<void>,
    message?: string,
  ): Promise<string>;
}
export interface State {
  storage: StorageProvider;
  release: () => Release;
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
  kubernetes?: K8sProps;
  subhosting?: SubhostingProps;
  /** @description property used at deco admin  */
  workspaces: SignalStringified<Workspace>[];
}

const getRepository = (site = "default"): Promise<IRepository> => {
  return siteRepo[site] ??= Promise.resolve(new Repository());
};

const setRepository = (site = "default", p: Promise<IRepository>) => {
  siteRepo[site] = p;
};
function useRepository(
  site: string,
  useFn: (repo: IRepository) => Promise<IRepository>,
): Promise<IRepository> {
  const repo = getRepository(site);
  const usePromise = repo.then(useFn);
  setRepository(
    site,
    usePromise.catch((err) => {
      console.error(`use repository error ${err} for site ${site}`);
      return repo;
    }),
  );
  return usePromise;
}

const siteRepo: Record<string, Promise<IRepository>> = {};
/**
 * @title Admin
 */
export default function App(
  {
    resolvables,
    github,
    kubernetes,
    subhosting: subhostingProps,
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
      storage: {
        getRepository,
        useRepository,
        patchDecofile(site, useDecofile, message = "empty") {
          return useRepository(site, async (repo) => {
            const stash = repo.workingTree();
            await stash.withinTransaction(useDecofile);
            const newRepository = await repo.commit(stash.createCommit({
              message,
              committer: { name: "Anonymous" },
            }));

            return newRepository.push();
          }).then((repo) => repo.head!);
        },
      },
      release: () => {
        const ctx = Context.active();
        return ctx.release!;
      },
      githubWebhookSecret,
      githubEventListeners: [
        ...github?.eventListeners ?? [],
        pushEventHandler as GithubEventListener,
        prEventHandler as GithubEventListener,
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
    resolvables,
    dependencies: [k8sApp, subhostingApp],
  };
}

export type AppContext = AC<
  & Omit<App<AIAssistantManifest>, "dependencies">
  & Omit<App<OpenAIManifest>, "dependencies">
  & ReturnType<typeof App>
>;

export type Manifest = ManifestOf<ReturnType<typeof App>>;
