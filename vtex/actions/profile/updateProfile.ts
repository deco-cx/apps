import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";
import User from "../../loaders/user.ts";

interface UpdateProfileInfo {
  firstName?: string;
  lastName?: string;
  email: string;
  homePhone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  corporateName?: string | null;
  tradeName?: string | null;
  businessPhone?: string | null;
  isCorporate?: boolean;
}

const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
  updateInfo: UpdateProfileInfo,
): Promise<typeof User | null> => {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    return null;
  }

  const mutation = `
    mutation UpdateProfile($input: ProfileInput!) {
      updateProfile(fields: $input) @context(provider: "vtex.store-graphql") {
        cacheId
        firstName
        lastName
        birthDate
        gender
        homePhone
        businessPhone
        document
        email
        tradeName
        corporateName
        corporateDocument
        stateRegistration
        isCorporate
      }
    }
  `;

  try {
    const { updateProfile: updatedUser } = await io.query<
      { updateProfile: typeof User },
      unknown
    >(
      {
        query: mutation,
        operationName: "UpdateProfile",
        variables: {
          input: updateInfo,
        },
      },
      {
        headers: {
          cookie,
        },
      },
    );
    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

export default loader;
