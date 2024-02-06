import {
  assertCreateIsFromFile,
  assertDeploymentIsFromFile,
  Platform,
} from "../../admin/platform.ts";
import { Project } from "./actions/projects/create.ts";
import { AppContext } from "./mod.ts";

let kvPromise: Promise<Deno.Kv> | undefined;

const PREFIX = ["subhosting", "sites"];

const saveSiteState = async (state: Project) => {
  kvPromise ??= Deno.openKv();

  const kv = await kvPromise;

  await kv.set([...PREFIX, state.name], state);
};

const getSiteState = async (site: string): Promise<Project | null> => {
  kvPromise ??= Deno.openKv();

  const kv = await kvPromise;

  return (await kv.get<Project>([...PREFIX, site])).value;
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
    sourceDirectory: "/src",
    sites: {
      create: async (props) => {
        assertCreateIsFromFile(props);
        const project = await actions.projects.create({ name: props.site });
        await saveSiteState(project);
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
          projectId: state?.id,
          databases: {
            default: state.defaultDatabaseId,
          },
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
