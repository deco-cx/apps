import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { Form } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Form ID
   * @description The ID of the form to retrieve
   */
  formId: string;
}

/**
 * @title Get Marketing Form
 * @description Retrieve a specific marketing form from HubSpot by ID
 */
export default async function getForm(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Form | null> {
  const { formId } = props;

  try {
    const client = new HubSpotClient(ctx);
    const form = await client.get<Form>(`/marketing/v3/forms/${formId}`);

    return form;
  } catch (error) {
    console.error("Error fetching form:", error);
    return null;
  }
}
