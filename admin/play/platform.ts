import kubernetes from "../../platforms/kubernetes/platform.ts";
import { AppContext } from "../mod.ts";
import { Platform } from "../platform.ts";
import { DeploymentId } from "../../platforms/kubernetes/actions/deployments/create.ts";

export type Kubernetes = AppContext["invoke"]["kubernetes"];
const siteName = "play";
const domain = "deco.site";
export default function play(
  k8s: Kubernetes,
): Platform {
  const k8sPlatform = kubernetes(k8s);
  return {
    ...k8sPlatform,
    name: "play",
    domain,
    sites: {
      create: async (props) => {
        await k8s.actions.domains.create({
          domain: `${props.site}.${domain}`,
          site: siteName,
          ephemeral: true,
        });
      },
      delete: (_props) => {
        throw new Error("not implemented");
      },
    },
    deployments: {
      promote: (_props) => {
        throw new Error("not implemented");
      },
      create: (
        props,
      ) => {
        return Promise.resolve({
          id: DeploymentId.new(),
          domains: [{
            url: `https://${props.site}.${domain}`,
            production: true,
          }],
        });
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
