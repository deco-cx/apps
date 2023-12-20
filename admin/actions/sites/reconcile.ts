import { SiteState, State } from "../../loaders/k8s/siteState.ts";
import { AppContext } from "../../mod.ts";
import { BuildStatus } from "../k8s/build.ts";
import { DeploymentId } from "../k8s/newService.ts";

export interface Props {
  site: string;
  currentState: SiteState | undefined;
  desiredState: SiteState;
  production: boolean;
}

export interface Domain {
  url: string;
  production: boolean;
}
export interface Deployment {
  id: string;
  domains: Domain[];
}

export interface ReconciliationResult {
  deployment: Deployment;
}
export default async function reconcile(
  { site, currentState, desiredState: ds, production: prod }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ReconciliationResult> {
  const { actions } = ctx.invoke["deco-sites/admin"];
  const desiredState = { ...ctx.defaultSiteState, ...ds };
  const hasReleaseChange = !currentState ||
    State.shouldReleaseNewVersion(currentState, desiredState);
  const production = prod ?? hasReleaseChange;
  const deploymentId = await DeploymentId.build(desiredState);

  // TODO (mcandeia)
  // This should treat as a workflow that only one is running at the same time in a given site. This should take its time and can run as longer as its necessary
  // This should be able to be cancelled and restarted at any time
  // This should be able to be triggered by a webhook

  // when code has changed so we need to build it.
  if (!currentState || State.shouldBuild(currentState, desiredState)) {
    const [status, timeout]: [BuildStatus, number] = production
      ? ["succeed" as const, currentState === undefined ? 200_000 : 60_000]
      : ["probably_will_succeed" as const, 6_000];
    (await actions.k8s.build({
      commitSha: desiredState.commitSha,
      repo: desiredState.repo,
      owner: desiredState.owner,
      site,
    })).waitUntil(status, timeout);
  }

  // a new service should be created regardless
  await actions.k8s.newService({
    production,
    site,
    deploymentId,
    siteState: desiredState,
  });

  const domains = [{
    url: `https://sites-${site}-${deploymentId}.decocdn.com`,
    production: false,
  }];
  if (production) {
    domains.push({
      url: `https://sites-${site}.decocdn.com`,
      production: true,
    });
    await actions.k8s.setSiteState({
      site,
      create: currentState === undefined,
      state: desiredState,
    });
  }
  return { deployment: { id: deploymentId, domains } };
}
