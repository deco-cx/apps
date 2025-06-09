import { OAuthTokens } from "../../../mcp/oauth.ts";
import { AIRTABLE_API_BASE_URL } from "../constants.ts";
import { AirtableBase, AirtableTable } from "./page-generator.ts";

export interface AirtableMetaResponse {
  bases: Array<{
    id: string;
    name: string;
    permissionLevel: string;
  }>;
}

export interface AirtableBaseSchema {
  tables: Array<{
    id: string;
    name: string;
    primaryFieldId: string;
    fields: Array<{
      id: string;
      name: string;
      type: string;
    }>;
  }>;
}

/**
 * Busca todas as bases disponíveis para o usuário autenticado
 */
export async function fetchUserBases(
  tokens: OAuthTokens,
): Promise<AirtableBase[]> {
  try {
    const response = await fetch(`${AIRTABLE_API_BASE_URL}/v0/meta/bases`, {
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching bases: ${response.status} ${response.statusText}`,
      );
    }

    const data: AirtableMetaResponse = await response.json();

    return data.bases.map((base) => ({
      id: base.id,
      name: base.name,
    }));
  } catch (error) {
    console.error("Error fetching bases from Airtable:", error);
    return [];
  }
}

/**
 * Busca todas as tabelas de uma base específica
 */
export async function fetchBaseTables(
  baseId: string,
  tokens: OAuthTokens,
): Promise<AirtableTable[]> {
  try {
    const response = await fetch(
      `${AIRTABLE_API_BASE_URL}/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          "Authorization": `Bearer ${tokens.access_token}`,
          "Accept": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching tables for base ${baseId}: ${response.status} ${response.statusText}`,
      );
    }

    const data: AirtableBaseSchema = await response.json();

    return data.tables.map((table) => ({
      id: table.id,
      name: table.name,
      baseId: baseId,
    }));
  } catch (error) {
    console.error(`Error fetching tables for base ${baseId}:`, error);
    return [];
  }
}

export async function fetchBasesAndTables(tokens: OAuthTokens): Promise<{
  bases: AirtableBase[];
  tables: AirtableTable[];
}> {
  try {
    const bases = await fetchUserBases(tokens);
    const allTables: AirtableTable[] = [];

    const tablePromises = bases.map((base) => fetchBaseTables(base.id, tokens));
    const tablesResults = await Promise.all(tablePromises);

    tablesResults.forEach((tables) => {
      allTables.push(...tables);
    });

    return {
      bases,
      tables: allTables,
    };
  } catch (error) {
    console.error("Error fetching Airtable data:", error);
    return {
      bases: [],
      tables: [],
    };
  }
}
