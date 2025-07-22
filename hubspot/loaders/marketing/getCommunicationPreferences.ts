import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { CommunicationPreferences } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Email Address
   * @description The email address of the contact to get preferences for
   */
  emailAddress: string;
}

/**
 * @title Get Communication Preferences
 * @description Retrieve communication preferences for a specific contact
 */
export default async function getCommunicationPreferences(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CommunicationPreferences | null> {
  const { emailAddress } = props;

  try {
    const client = new HubSpotClient(ctx);

    const response = await client.get<CommunicationPreferences>(
      `/communication-preferences/v3/status/email/${
        encodeURIComponent(emailAddress)
      }`,
    );

    return response;
  } catch (error) {
    console.error("Error fetching communication preferences:", error);
    return null;
  }
}
