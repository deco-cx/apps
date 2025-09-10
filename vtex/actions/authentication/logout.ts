// import { getCookies, getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
// import { setSegmentBag } from "../../utils/segment.ts";
import { redirect } from "@deco/deco";

export interface Props {
  /**
   * URL para redirecionar após o logout
   * @default "/"
   */
  returnUrl?: string;
}

/**
 * @title VTEX Integration - Logout
 * @description Performs user logout and cleans session data
 */
export default async function action(
  { returnUrl = "/" }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Response> {
  const { account } = ctx;

  console.log("[Logout Action] Starting logout process");

  const logoutUrl = `/api/vtexid/pub/logout?scope=${account}`;

  const logoutResponse = await fetch(new URL(logoutUrl, req.url).href, {
    method: "GET",
    headers: {
      "cookie": req.headers.get("cookie") || "",
    },
    redirect: "manual",
  });

  proxySetCookie(logoutResponse.headers, ctx.response.headers, req.url);

  // const upstreamSetCookies = getSetCookies(logoutResponse.headers);
  // const { record: updatedCookies } = buildCookieJar(req.headers, upstreamSetCookies);

  const validateSession = await ctx.invoke.vtex.actions.session
    .validateSession();
  console.log("[Logout Action] Validate session:", validateSession);

  // console.log("[Logout Action] Updated cookies after logout:", {
  //   hasVtexSession: !!updatedCookies.vtex_session,
  //   hasVtexSegment: !!updatedCookies.vtex_segment,
  //   vtexSegment: updatedCookies.vtex_segment,
  // });

  // // 4. Forçar limpeza do segment removendo priceTables e campaigns
  // // Como acabamos de fazer logout, vamos criar um segment limpo
  // const cleanCookies = {
  //   ...updatedCookies,
  //   // Remover o vtex_segment antigo para forçar criação de um novo
  //   vtex_segment: undefined,
  // };

  // // 5. Atualizar o segment bag com os cookies limpos
  // setSegmentBag(cleanCookies, req, ctx);

  // console.log("[Logout Action] Logout completed, redirecting to:", returnUrl);

  // ctx.response.headers.set("Location", returnUrl);
  // ctx.response.status = 302;
  // return validateSession;
  redirect(returnUrl);
  return validateSession;
}
