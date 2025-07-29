import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { CommunicationPreferences } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Email Address
   * @description The email address of the contact to update preferences for
   */
  emailAddress: string;

  /**
   * @title Subscriptions
   * @description Array of subscription updates
   */
  subscriptions: Array<{
    /**
     * @title Subscription ID
     * @description The ID of the subscription to update
     */
    id: string;

    /**
     * @title Status
     * @description The new subscription status
     */
    status: "SUBSCRIBED" | "UNSUBSCRIBED" | "NOT_OPTED_IN";

    /**
     * @title Legal Basis
     * @description The legal basis for processing (required for GDPR compliance)
     */
    legalBasis?:
      | "LEGITIMATE_INTEREST_PQL"
      | "LEGITIMATE_INTEREST_CLIENT"
      | "LEGITIMATE_INTEREST_OTHER"
      | "PERFORMANCE_OF_CONTRACT"
      | "CONSENT_WITH_NOTICE"
      | "NON_GDPR"
      | "PROCESS_AND_STORE";

    /**
     * @title Legal Basis Explanation
     * @description Explanation for the legal basis
     */
    legalBasisExplanation?: string;
  }>;
}

/**
 * @title Update Communication Preferences
 * @description Update communication preferences for a specific contact
 */
export default async function updateCommunicationPreferences(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CommunicationPreferences> {
  const client = new HubSpotClient(ctx);

  const updateData = {
    subscriptions: props.subscriptions,
  };

  const response = await client.post<CommunicationPreferences>(
    `/communication-preferences/v3/status/email/${
      encodeURIComponent(props.emailAddress)
    }`,
    updateData,
  );

  return response;
}
