import { AppContext } from "../mod.ts";

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
 * @title Delete Contact
 * @description Delete a contact from RD Station Marketing
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> => {
  // Construct the path with the colon format required by RD Station API
  const pathSegment = `${props.identifier}:${props.value}`;

  await ctx.api["DELETE /platform/contacts/*identifier"]({
    identifier: pathSegment,
  });

  return { success: true };
};

export default action;
