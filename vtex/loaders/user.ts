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
  homePhone?: string;
  businessPhone?: string;
}

/**
 * @title Get User
 * @description Get the user logged in
 */
async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const query =
    "query getUserProfile { profile { id userId email firstName lastName profilePicture gender document homePhone businessPhone }}";

  try {
    const { profile: user } = await io.query<{ profile: User }, null>(
      { query },
      { headers: { cookie } },
    );

    return {
      "@id": user.userId ?? user.id,
      email: user.email,
      givenName: user.firstName,
      familyName: user.lastName,
      taxID: user?.document?.replace(/[^\d]/g, ""),
      gender: user.gender
        ? user.gender === "f"
          ? "https://schema.org/Female"
          : "https://schema.org/Male"
        : undefined,
      telephone: user.homePhone ?? user.businessPhone,
    };
  } catch (_) {
    return null;
  }
}

export default loader;
