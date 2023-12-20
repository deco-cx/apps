import { hashString } from "../../hash/shortHash.ts";
import { AppContext } from "../../mod.ts";

export const DeploymentId = {
  build: (commitSha: string, release?: string) =>
    hashString(`${commitSha}-${release}`),
};

export interface Props {
  site: string;
  commitSha: string;
  repo: string;
  /**
   * @default deco-sites
   */
  owner?: string;
  production: boolean;
}
interface Domain {
  url: string;
  production: boolean;
}
export interface Deployment {
  id: string;
  domains: Domain[];
}

export default async function deploy(
  { commitSha, repo, owner, production, site }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Deployment> {
  const { loaders, actions } = ctx.invoke["deco-sites/admin"];
  const [{ image: builderImage }, { image: runnerImage }, siteState] =
    await Promise.all([
      loaders.k8s
        .builderConfig(),
      loaders.k8s.runnerConfig(),
      loaders.k8s.siteState({ site }),
    ]);
  const ghOrg = owner ?? "deco-sites";
  const [{ sourceBinder, waitUntil }, deploymentId] = await Promise.all([
    actions.k8s.build({
      commitSha,
      repo,
      owner: ghOrg,
      site,
      builderImage,
    }),
    DeploymentId.build(commitSha, siteState?.release),
  ]);

  if (production) {
    await waitUntil("succeed", 60_000);
  } else {
    await waitUntil("probably_will_succeed", 6_000);
  }

  await actions.k8s.newService({
    production,
    site,
    deploymentId,
    runnerImage,
    sourceBinder,
  });
  await actions.k8s.setSiteState({
    site,
    create: siteState === undefined,
    state: {
      ...siteState ?? {},
      owner: ghOrg,
      repo,
      release: undefined,
      commitSha,
    },
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
  }
  return { id: deploymentId, domains };
}
