import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { parseCookie } from "../utils/vtexId.ts";

export interface User {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  gender?: string;
  document?: string;
  homePhone?: string;
  birthDate?: string;
  corporateDocument?: string;
  corporateName?: string;
  tradeName?: string;
  businessPhone?: string;
  isCorporate?: boolean;
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
    `query getUserProfile { profile(customFields: "isNewsletterOptIn") { id userId email firstName lastName profilePicture gender document homePhone birthDate corporateDocument corporateName tradeName businessPhone isCorporate customFields { key value } }}`;

  try {
    const { profile: user } = await io.query<{ profile: User }, null>(
      { query },
      { headers: { cookie } },
    );

    return {
      "@id": user?.userId ?? user.id,
      email: user.email,
      givenName: user?.firstName,
      familyName: user?.lastName,
      taxID: user?.document?.replace(/[^\d]/g, ""),
      gender: user?.gender === "female"
        ? "https://schema.org/Female"
        : "https://schema.org/Male",
      telephone: user?.homePhone,
      birthDate: user?.birthDate,
      corporateName: user?.corporateName,
      tradeName: user?.tradeName,
      corporateDocument: user?.corporateDocument,
      businessPhone: user?.businessPhone,
      isCorporate: user?.isCorporate,
      customFields: user?.customFields,
    };
  } catch (_) {
    return null;
  }
}

export default loader;
