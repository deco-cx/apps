import type { AppContext } from "../../mod.ts";
import { HubSpotClient } from "../../utils/client.ts";

export interface AccountInfo {
  portalId: number;
  timeZone: string;
  companyCurrency: string;
  additionalCurrencies: string[];
  utcOffset: string;
  utcOffsetMilliseconds: number;
  uiDomain: string;
  dataHostingLocation: string;
  accountType: string;
  companyName?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

/**
 * @title Get Account Information
 * @description Retrieve account information and settings from HubSpot
 */
export default async function getAccount(
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<AccountInfo | null> {
  try {
    const client = new HubSpotClient(ctx);
    const account = await client.get<AccountInfo>("/account-info/v3/details");

    return account;
  } catch (error) {
    console.error("Error fetching account info:", error);
    return null;
  }
}
