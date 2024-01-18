// deno-lint-ignore-file no-unused-vars require-await
import { assertCreateIsFromFile } from "../../admin/platform.ts";
import { Platform } from "../../admin/platform.ts";
import { AppContext } from "./mod.ts";

const DECO_RELEASE_ENV_VAR = "DECO_RELEASE";

const kv = await Deno.openKv();
type Subhosting = AppContext["invoke"]["deno-subhosting"];
export default function subhosting(
  subhosting: Subhosting,
): Platform {
  const { actions } = subhosting;
  return {
    name: "subhosting",
    domain: "deco.site",
    cfZoneId: "c95fc4cec7fc52453228d9db170c372c",
    sites: {
      create: async (props) => {
        assertCreateIsFromFile(props);
        throw new Error("not implemented");
      },
      delete: async (props) => {
        throw new Error("not implemented");
      },
    },
    deployments: {
      promote: async (props) => {
        throw new Error("not implemented");
      },
      create: async (
        { site, commitSha, owner, repo, production = false },
      ) => {
        throw new Error("not implemented");
      },
      update: async ({ site, release }) => {
        throw new Error("not implemented");
      },
    },
    domains: {
      create: async (props) => {
        throw new Error("not implemented");
      },
      delete: async (props) => {
        throw new Error("not implemented");
      },
    },
  };
}
