import { AppContext } from "../../mod.ts";

function getReturnUrl(url: string, defaultUrl: string = "/") {
  const returnUrl = url?.split("returnUrl=")?.[1] || defaultUrl;
  return decodeURIComponent(returnUrl);
}

export async function loader(_: unknown, req: Request, ctx: AppContext) {
  const returnUrl = getReturnUrl(req.url);

  await ctx.invoke.vtex.actions.authentication.logout({
    returnUrl,
  });

  return null;
}

export default function Logout() {
  return null;
}
