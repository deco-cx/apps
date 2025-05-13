import { AppContext } from "../mod.ts";
import { Contact } from "../client.ts";

export interface Props {
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
 * @title Get Contact
 * @description Retrieves a specific contact by uuid or email
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Contact> => {
  // Construct the path with the colon format required by RD Station API
  // Format should be: "uuid:123" or "email:user@example.com"
  const pathSegment = `${props.identifier}:${props.value}`;

  console.log("pathSegment", pathSegment);
  const response = await ctx.api["GET /platform/contacts/*identifier"]({
    identifier: pathSegment,
  });

  console.log("response", response);

  const result = await response.json();
  return result;
};

export default loader;
