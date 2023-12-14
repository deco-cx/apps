import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const PATHS_TO_PROXY = [
  ["/checkout", "/checkout"],
  ["/Fechamento"],
  ["/Fechamento/*"],
  ["/Login"],
  ["/login/*"],
  ["/Login/Authenticate"],
  ["/Carrinho/*"],
  ["/api/*"],
];

/**
 * @title Wake Proxy Routes
 */
function loader(
  _props: unknown,
  _req: Request,
  { checkoutUrl }: AppContext,
): Route[] {
  const checkout = PATHS_TO_PROXY.map(([pathTemplate, basePath]) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: checkoutUrl,
        basePath,
        customHeaders: [{
          Host: checkoutUrl,
        }],
      },
    },
  }));

  return checkout;
}

export default loader;
