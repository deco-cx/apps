import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { parseCookie } from "../utils/vtexId.ts";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  gender?: string;
}

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
    "query getUserProfile { profile { id email firstName lastName profilePicture gender }}";

  try {
    const { profile: user } = await io.query<{ profile: User }, null>(
      { query },
      { headers: { cookie } },
    );

    return {
      "@id": user.id,
      email: user.email,
      givenName: user.firstName,
      familyName: user.lastName,
      gender: user.gender === "f"
        ? "https://schema.org/Female"
        : "https://schema.org/Male",
    };
  } catch (_) {
    return null;
  }
}

export default loader;
