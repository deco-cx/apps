import {
  assertCreateIsFromFile,
  assertDeploymentIsFromFile,
  Platform,
} from "../../admin/platform.ts";
import { AppContext } from "./mod.ts";

const kv = await Deno.openKv();
interface SiteState {
  site: string;
  projectId: string;
}
const saveSiteState = async (state: SiteState) => {
  await kv.set(["subhosting", "sites", state.site], state);
};

const getSiteState = async (site: string): Promise<SiteState | null> => {
  return (await kv.get<SiteState>(["sites", site])).value;
};
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
        const project = await actions.projects.create({ name: props.site });
        await saveSiteState({ site: project.name, projectId: project.id });
      },
      delete: (_props) => {
        throw new Error("not implemented");
      },
    },
    deployments: {
      promote: (_props) => {
        throw new Error("not implemented");
      },
      create: async (
        props,
      ) => {
        assertDeploymentIsFromFile(props);
        const state = await getSiteState(props.site);
        if (!state) {
          throw new Error(`site ${props.site} not found`);
        }
        const deployment = await actions.deployments.create({
          projectId: state?.projectId,
          ...props,
        });
        return {
          id: deployment.id,
          domains: deployment.domain
            ? [{ url: deployment.domain, production: true }]
            : [],
        };
      },
      update: (_props) => {
        throw new Error("not implemented");
      },
    },
    domains: {
      create: (_props) => {
        throw new Error("not implemented");
      },
      delete: (_props) => {
        throw new Error("not implemented");
      },
    },
  };
}
