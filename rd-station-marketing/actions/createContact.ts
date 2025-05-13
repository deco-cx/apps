import { AppContext } from "../mod.ts";
import { Contact, CreateContactRequest } from "../client.ts";

export interface Props extends CreateContactRequest {
  /**
   * @title Email
   * @description Email of the contact (required)
   */
  email: string;
}

/**
 * @title Create Contact
 * @description Create a new contact in RD Station Marketing
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Contact> => {
  const response = await ctx.api["POST /platform/contacts"](
    {},
    {
      body: {
        email: props.email,
        name: props.name,
        job_title: props.job_title,
        birthdate: props.birthdate,
        bio: props.bio,
        website: props.website,
        personal_phone: props.personal_phone,
        mobile_phone: props.mobile_phone,
        city: props.city,
        state: props.state,
        country: props.country,
        twitter: props.twitter,
        facebook: props.facebook,
        linkedin: props.linkedin,
        tags: props.tags,
        legal_bases: props.legal_bases,
      },
    },
  );

  const result = await response.json();
  return result;
};

export default action;
