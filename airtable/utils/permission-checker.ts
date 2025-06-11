import type { AppContext } from "../mod.ts";
import {
  AirtableBase,
  AirtableTable,
  BaseSchemaResponse,
  ListBasesResponse,
  ListRecordsResponse,
} from "./types.ts";

interface PermissionCheck {
  hasPermission: boolean;
  message?: string;
}

interface Permission {
  bases?: AirtableBase[];
  tables?: AirtableTable[];
}

export function filterProps<T extends Record<string, unknown>>(
  ctx: AppContext,
  props: T,
): T | Response {
  const permission = ctx.permission as Permission | undefined;

  if (
    !permission ||
    ((!permission.bases || permission.bases.length === 0) &&
      (!permission.tables || permission.tables.length === 0))
  ) {
    return props;
  }

  const hasBasesRestriction = permission.bases && permission.bases.length > 0;
  const hasTablesRestriction = permission.tables &&
    permission.tables.length > 0;

  if (hasBasesRestriction && props.baseId) {
    const hasBasePermission = permission.bases!.some(
      (base) => base.id === props.baseId,
    );

    if (!hasBasePermission) {
      return new Response(
        `You don't have permission to access the base ${props.baseId}`,
        { status: 403 },
      );
    }
  }

  if (hasTablesRestriction && props.tableIdOrName) {
    const hasTablePermission = permission.tables!.some(
      (table) =>
        table.id === props.tableIdOrName || table.name === props.tableIdOrName,
    );

    if (!hasTablePermission) {
      return new Response(
        `You don't have permission to access the table ${props.tableIdOrName}`,
        { status: 403 },
      );
    }
  }

  return props;
}

export function checkPermission(
  ctx: AppContext,
  baseId: string,
  tableIdOrName?: string,
): PermissionCheck {
  const permission = ctx.permission as Permission | undefined;

  if (
    !permission ||
    ((!permission.bases || permission.bases.length === 0) &&
      (!permission.tables || permission.tables.length === 0))
  ) {
    return { hasPermission: true };
  }

  const hasBasesRestriction = permission.bases && permission.bases.length > 0;
  const hasTablesRestriction = permission.tables &&
    permission.tables.length > 0;

  if (hasBasesRestriction) {
    const hasBasePermission = permission.bases!.some(
      (base) => base.id === baseId,
    );

    if (!hasBasePermission) {
      return {
        hasPermission: false,
        message: `You don't have permission to access the base ${baseId}`,
      };
    }
  }

  if (tableIdOrName && hasTablesRestriction) {
    const hasTablePermission = permission.tables!.some(
      (table) => table.id === tableIdOrName || table.name === tableIdOrName,
    );

    if (!hasTablePermission) {
      return {
        hasPermission: false,
        message:
          `You don't have permission to access the table ${tableIdOrName}`,
      };
    }
  }

  return { hasPermission: true };
}

export function filterResponseByPermission(
  response: ListBasesResponse | ListRecordsResponse | BaseSchemaResponse,
  permission: Permission | undefined,
): ListBasesResponse | ListRecordsResponse | BaseSchemaResponse {
  if (
    !permission ||
    ((!permission.bases || permission.bases.length === 0) &&
      (!permission.tables || permission.tables.length === 0))
  ) {
    return response;
  }

  const isBase = "bases" in response;
  const isRecord = "records" in response;
  const isTable = "tables" in response;

  const hasBasesRestriction = permission.bases && permission.bases.length > 0;
  const hasTablesRestriction = permission.tables &&
    permission.tables.length > 0;

  if (isBase && hasBasesRestriction) {
    const filteredBases = response.bases.filter((base) =>
      permission.bases!.some((p) => p.id === base.id)
    );
    return { ...response, bases: filteredBases };
  } else if (isRecord) {
    return response;
  } else if (isTable && hasTablesRestriction) {
    const filteredTables = response.tables.filter((table) =>
      permission.tables!.some((p) => p.id === table.id || p.name === table.name)
    );
    return { ...response, tables: filteredTables };
  }

  return response;
}
