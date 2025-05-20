import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Types for fixed assets
export interface FixedAsset {
  patrimonyId: number;
  detail?: string;
  observation?: string;
  costCenter?: number;
  situation?: string;
  preservation?: string;
  propertyRegistration?: string;
  landRegistration?: string;
  previousOswner?: string;
  privateArea?: number;
  commonArea?: number;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  postalCode?: string;
  incorporationForm?: string;
  incorporationDate?: string;
  incorporationValue?: number;
  accountancyIncorporationAccount?: string;
  accountancyIdentity?: string;
  accountancyOrigin?: string;
  accountancyUsageIndicator?: string;
  depreciationInitialDate?: string;
  depreciationDebitAccount?: string;
  depreciationCreditAccount?: string;
  depreciationValue?: number;
}

export interface ResultSetMetadata {
  count: number;
  offset: number;
  limit: number;
}

export interface GetResponseFixedAssets {
  resultSetMetadata: ResultSetMetadata;
  results: FixedAsset[];
}

// API client interface
export interface FixedAssetsClient {
  "GET /patrimony/fixed": {
    response: GetResponseFixedAssets;
    searchParams?: {
      patrimonyId?: number;
      costCenter?: string;
      detail?: string;
      situation?: string;
      limit?: number;
      offset?: number;
    };
  };
}

// Function to create API client
export function createFixedAssetsClient(state: State) {
  return createRestClient<FixedAssetsClient>(state);
}
