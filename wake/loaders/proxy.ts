import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

/**
 * @title Wake Proxy Routes
 */
function loader(
  _props: unknown,
  _req: Request,
  { account }: AppContext,
): Route[] {
  const checkout = [
    ["/checkout", "/checkout"],
    ["/Fechamento"],
    ["/Login"],
    ["/login/*"],
    ["/api/*"],
  ].map(([pathTemplate, basePath]) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: `https://${account}.checkout.fbits.store`,
        basePath,
        customHeaders: {
          Host: "erploja2.checkout.fbits.store",
        },
      },
    },
  }));

  return checkout;
}

export default loader;
