import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface Props {
  /**
   * @title Workflow ID
   * @description The ID of the workflow to enroll the contact in
   */
  workflowId: string;

  /**
   * @title Contact Email
   * @description Email address of the contact to enroll
   */
  email?: string;

  /**
   * @title Contact ID
   * @description HubSpot contact ID (alternative to email)
   */
  contactId?: string;
}

export interface EnrollmentResponse {
  succeeded: string[];
  invalidEmails: string[];
  invalidContactIds: string[];
}

/**
 * @title Enroll in Workflow
 * @description Enroll a contact in an automation workflow
 */
export default async function enrollInWorkflow(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<EnrollmentResponse> {
  const { workflowId, email, contactId } = props;

  if (!email && !contactId) {
    throw new Error("Either email or contactId must be provided");
  }

  const client = new HubSpotClient(ctx);

  const enrollmentData = {
    ...(email && { emails: [email] }),
    ...(contactId && { contactIds: [contactId] }),
  };

  const response = await client.post<EnrollmentResponse>(
    `/automation/v2/workflows/${workflowId}/enrollments/contacts`,
    enrollmentData,
  );

  return response;
}
