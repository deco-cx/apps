import { Route } from "../../website/flags/audience.ts";
import { Script } from "../../website/types.ts";
import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Scripts to include on Html head
   */
  includeScriptsToHead?: {
    includes?: Script[];
  };
}

/**
 * @title Wap Proxy Routes
 */
function loader(
  { includeScriptsToHead = { includes: [] } }: Props,
  _req: Request,
  ctx: AppContext,
): Route[] {
  const { baseUrl } = ctx;

  const checkout = [
    ["/minha-conta"],
    ["/checkout"],
    ["/checkout/*"],
    ["/minha-conta/*"],
  ].map(([pathTemplate, basePath]) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: baseUrl,
        basePath,
        customHeaders: [{
          Host: baseUrl,
        }],
        includeScriptsToHead,
      },
    },
  }));

  return checkout;
}

export default loader;
