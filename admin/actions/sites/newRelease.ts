import { badRequest } from "deco/mod.ts";
import { AppContext } from "../../mod.ts";
import { SrcBinder } from "../k8s/build.ts";
import { DeploymentId } from "../k8s/newService.ts";
export interface Props {
  site: string;
  release: string;
}

export default async function newRelease(
  { site, release }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { actions, loaders } = ctx.invoke["deco-sites/admin"];
  const currentState = await loaders.k8s.siteState({ site });
  if (!currentState) {
    badRequest({ message: "site does not exist" });
    return;
  }
  const deploymentId = await DeploymentId.build(
    currentState.commitSha,
    release,
  );
  await actions.k8s.newService({
    deploymentId,
    production: true,
    site,
    sourceBinder: SrcBinder.fromRepo(
      currentState.owner,
      currentState.repo,
      currentState.commitSha,
    ),
  });
  await actions.k8s.setSiteState({
    site,
    state: {
      ...currentState,
      release,
    },
  });
}
