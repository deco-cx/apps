import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type { User } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Email
   * @description The user's email address (required, must be unique)
   */
  email: string;

  /**
   * @title First Name
   * @description The user's first name
   */
  firstName?: string;

  /**
   * @title Last Name
   * @description The user's last name
   */
  lastName?: string;

  /**
   * @title Role ID
   * @description The ID of the role to assign to the user
   */
  roleId?: string;

  /**
   * @title Primary Team ID
   * @description The ID of the primary team for the user
   */
  primaryTeamId?: string;

  /**
   * @title Send Welcome Email
   * @description Whether to send a welcome email to the user
   */
  sendWelcomeEmail?: boolean;

  /**
   * @title Super Admin
   * @description Whether the user should be a super admin
   */
  superAdmin?: boolean;
}

/**
 * @title Create User
 * @description Create a new user in HubSpot Settings
 */
export default async function createUser(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<User> {
  const client = new HubSpotClient(ctx);

  const userInput = {
    email: props.email,
    firstName: props.firstName,
    lastName: props.lastName,
    roleId: props.roleId,
    primaryTeamId: props.primaryTeamId,
    sendWelcomeEmail: props.sendWelcomeEmail,
    superAdmin: props.superAdmin,
  };

  const response = await client.post<User>("/settings/v3/users", userInput);

  return response;
}
