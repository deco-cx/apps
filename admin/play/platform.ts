import kubernetes from "../../platforms/kubernetes/platform.ts";
import { AppContext } from "../mod.ts";
import { Platform } from "../platform.ts";

export type Kubernetes = AppContext["invoke"]["kubernetes"];
const siteName = "play";
export default function play(
  k8s: Kubernetes,
): Platform {
  const k8sPlatform = kubernetes(k8s);
  return {
    ...k8sPlatform,
    name: "play",
    sites: {
      create: async (props) => {
        await k8s.actions.domains.create({
          domain: `${props.site}.deco.site`,
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
        _props,
      ) => {
        throw new Error("not implemented");
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
