import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";
import type {
  SimplePublicObject,
  SimplePublicObjectInput,
} from "../../utils/types.ts";

export interface Props {
  /**
   * @title Company Properties
   * @description Key-value pairs of company properties
   */
  properties: Record<string, string>;

  /**
   * @title Associations
   * @description Objects to associate with this company
   */
  associations?: Array<{
    to: {
      id: string;
    };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

/**
 * @title Create Company
 * @description Create a new company in HubSpot CRM
 */
export default async function createCompany(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SimplePublicObject> {
  const { properties, associations } = props;

  const client = new HubSpotClient(ctx);

  const companyInput: SimplePublicObjectInput = {
    properties,
    ...(associations && { associations }),
  };

  const company = await client.createObject("companies", companyInput);
  return company;
}
