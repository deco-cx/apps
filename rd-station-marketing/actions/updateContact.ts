import { AppContext } from "../mod.ts";
import { Contact, UpdateContactRequest } from "../client.ts";

export interface Props extends UpdateContactRequest {
  /**
   * @title Identifier
   * @description The type of identifier to use (uuid or email)
   */
  identifier: "uuid" | "email";

  /**
   * @title Identifier Value
   * @description The value of the identifier (the uuid or email)
   */
  value: string;
}

/**
 * @title Update Contact
 * @description Update an existing contact in RD Station Marketing
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Contact> => {
  const { identifier, value, ...contactData } = props;

  // Construct the path with the colon format required by RD Station API
  const pathSegment = `${identifier}:${value}`;

  const response = await ctx.api["PATCH /platform/contacts/*identifier"](
    { identifier: pathSegment },
    { body: contactData },
  );

  const result = await response.json();
  return result;
};

export default action;
