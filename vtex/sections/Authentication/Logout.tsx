import { AppContext } from "../../mod.ts";

function getReturnUrl(req: Request, defaultUrl: string = "/"): string {
  const url = new URL(req.url);
  const returnUrl = url.searchParams.get("returnUrl") || defaultUrl;

  try {
    const parsed = new URL(returnUrl, url.origin);
    if (parsed.origin !== url.origin) {
      return defaultUrl;
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return defaultUrl;
  }
}

export async function loader(_: unknown, req: Request, ctx: AppContext) {
  const returnUrl = getReturnUrl(req);

  await ctx.invoke.vtex.actions.authentication.logout({ returnUrl });

  return null;
}

export default function Logout() {
  return null;
}
