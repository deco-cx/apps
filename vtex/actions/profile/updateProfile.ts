import { AppContext } from "../../mod.ts";
import { parseCookie } from "../../utils/vtexId.ts";
import { Person } from "../../../commerce/types.ts";
import type { User } from "../../loaders/user.ts";

export interface UserMutation {
  firstName?: string;
  lastName?: string;
  email?: string;
  homePhone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  corporateName?: string | null;
  tradeName?: string | null;
  businessPhone?: string | null;
  isCorporate?: boolean;
}

const updateProfile = async (
  props: UserMutation,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> => {
  const { io } = ctx;
  const { cookie } = parseCookie(req.headers, ctx.account);

  if (!props?.email) {
    console.error("User profile not found or email is missing:", props.email);
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
      { updateProfile: User },
      { input: UserMutation }
    >(
      {
        query: mutation,
        operationName: "UpdateProfile",
        variables: {
          input: {
            ...props,
            email: props.email,
          },
        },
      },
      { headers: { cookie } },
    );

    return {
      "@id": updatedUser?.userId ?? updatedUser.id,
      email: updatedUser.email,
      givenName: updatedUser?.firstName,
      familyName: updatedUser?.lastName,
      taxID: updatedUser?.document?.replace(/[^\d]/g, ""),
      gender: (updatedUser?.gender === "f" || updatedUser?.gender === "female")
        ? "https://schema.org/Female"
        : "https://schema.org/Male",
      telephone: updatedUser?.homePhone,
      birthDate: updatedUser?.birthDate,
      corporateName: updatedUser?.tradeName,
      corporateDocument: updatedUser?.corporateDocument,
      businessPhone: updatedUser?.businessPhone,
      isCorporate: updatedUser?.isCorporate,
      customFields: updatedUser?.customFields,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

export default updateProfile;
