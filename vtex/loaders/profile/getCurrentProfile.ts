import type { AppContext } from "../../mod.ts";
import type { Profile } from "../../utils/types.ts";
import { parseCookie } from "../../utils/vtexId.ts";

const addressProperties = `
addressType
receiverName
addressId
postalCode
city
state
country
street
number
neighborhood
complement
reference
geoCoordinates
`;
const query = `query getUserProfile($customFields: String) {
  profile(customFields: $customFields) {
    id
    cacheId
    email
    firstName
    lastName
    document
    userId
    birthDate
    gender
    homePhone
    businessPhone
    addresses { ${addressProperties} }
    isCorporate
    tradeName
    corporateName
    corporateDocument
    stateRegistration
    payments {
      cacheId
      id
      paymentSystem
      paymentSystemName
      cardNumber
      address { ${addressProperties} }
      isExpired
      expirationDate
      accountStatus
    }
    customFields {
      key
      value
    }
    passwordLastUpdate
  }
}`;

interface Props {
  customFields?: string[];
}

/**
 * @title Get Current Profile
 * @description Get the current profile
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Profile> {
  const { io } = ctx;
  const { cookie, payload } = parseCookie(req.headers, ctx.account);

  if (!payload?.sub || !payload?.userId) {
    throw new Error("User cookie is invalid");
  }

  const { profile } = await io.query<
    { profile: Profile },
    { customFields?: string }
  >(
    { query, variables: { customFields: props.customFields?.join(",") } },
    { headers: { cookie } },
  );

  return profile;
}

export const defaultVisibility = "private";
export default loader;
