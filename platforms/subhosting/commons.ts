import { badRequest } from "deco/mod.ts";

export interface SubhostingConfig {
  deployAccessToken?: string;
  deployOrgId?: string;
  projectId?: string;
}

export function assertHasDeploymentParams(
  p: SubhostingConfig,
): asserts p is {
  deployAccessToken: string;
  deployOrgId: string;
  projectId: string;
} {
  if (!p.deployAccessToken || !p.deployOrgId || !p.projectId) {
    badRequest({ message: "Missing deploy access token or org id" });
  }
}
