import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { parseCookie } from "../utils/vtexId.ts";

interface User {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  gender?: string;
  document?: string;
}

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> {
  const { io, vcsDeprecated } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const query =
    "query getUserProfile { profile { id userId email firstName lastName profilePicture gender document }}";

  try {
    const { profile: user } = await io.query<{ profile: User }, null>(
      { query },
      { headers: { cookie } },
    );

    if (!user) {
      const vtexIdClientAutCookie = req.headers.get("cookie")?.split(";").find(
        (cookie) => cookie.trim().startsWith("VtexIdclientAutCookie_"),
      );
      if (vtexIdClientAutCookie) {
        const response =
          await (await vcsDeprecated["GET /api/vtexid/credential/validate"](
            {},
            {
              body: { token: vtexIdClientAutCookie?.split("=")[1] },
              headers: {
                "content-type": "application/json",
                accept: "application/json",
              },
            },
          )).json();
        if (response.authStatus === "Success") {
          return {
            "@id": response.id,
            email: response.user,
            givenName: response.user.split("@")[0],
            familyName: "",
          };
        }
      }
    }

    return {
      "@id": user.userId ?? user.id,
      email: user.email,
      givenName: user.firstName,
      familyName: user.lastName,
      taxID: user?.document?.replace(/[^\d]/g, ""),
      gender: user.gender === "f"
        ? "https://schema.org/Female"
        : "https://schema.org/Male",
    };
  } catch (_) {
    return null;
  }
}

export default loader;
