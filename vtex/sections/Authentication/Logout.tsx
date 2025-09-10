import { AppContext } from "../../mod.ts";

function getReturnUrl(url: string, defaultUrl: string = "/") {
  const returnUrl = url?.split("returnUrl=")?.[1] || defaultUrl;
  return decodeURIComponent(returnUrl);
}

export async function loader(_: unknown, req: Request, ctx: AppContext) {
  const returnUrl = getReturnUrl(req.url);
  console.log("SECTION LOGOUT returnUrl", returnUrl);
  const teste = await ctx.invoke.vtex.actions.authentication.logout({
    returnUrl,
  });
  console.log("SECTION LOGOUT teste", teste);
  return teste;
}

export default function Logout() {
  return null;
}
