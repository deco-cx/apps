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
  customFields?: { key: string; value: string }[];
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
    `query getUserProfile { profile(customFields: "isNewsletterOptIn") { id userId email firstName lastName profilePicture gender document homePhone customFields { key value } }}`;

  try {
    const data = await io.query<{ profile: User }, null>(
      { query },
      { headers: { cookie } },
    );

    const { profile: user } = data;

    return {
      "@id": user.userId ?? user.id,
      email: user.email,
      givenName: user.firstName,
      familyName: user.lastName,
      taxID: user?.document?.replace(/[^\d]/g, ""),
      gender: user.gender === "f"
        ? "https://schema.org/Female"
        : "https://schema.org/Male",
      telephone: user.homePhone,
      customFields: user.customFields,
    };
  } catch (_) {
    return null;
  }
}

export default loader;
