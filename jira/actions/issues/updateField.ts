import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description The key of the Jira issue (e.g., N25-3)
   */
  issueKey: string;
  /**
   * @description The field ID or name to update (e.g., "summary", "description", or a custom field ID like "customfield_10011")
   */
  field: string;
  /**
   * @description The new value for the field
   */
  value: string;
}

/**
 * @name UPDATE_FIELD
 * @title Update Issue Field
 * @description Updates a specific field of a Jira issue
 */
export default async function updateField(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.jira.updateField(props.issueKey, props.field, props.value);
}
