import { AppContext } from "../../mod.ts";
import {
  AllowedTablesBasesResponse,
  BaseSchemaResponse,
  BaseWithTables,
  FilteredOperationResult,
  ListBasesResponse,
  ListRecordsResponse,
  OperationItem,
  PermissionCheck,
  PermissionResult,
  ValidationErrorResult,
  ValidationFilterResult,
} from "../../utils/types.ts";

type ExtendedValidationResult =
  | PermissionCheck
  | ValidationFilterResult
  | ValidationErrorResult
  | FilteredOperationResult
  | { error: string };

interface ValidatePermissionsProps {
  mode: "check" | "filter" | "filter-operations";
  baseId?: string;
  tableIdOrName?: string;
  props?: Record<string, unknown>;
  response?: ListBasesResponse | ListRecordsResponse | BaseSchemaResponse;
  operations?: OperationItem[];
}

/**
 * @name VALIDATE_PERMISSIONS
 * @internal
 * @title Validate User Permissions
 * @description Validates if user has permission to access bases/tables or filters data based on permissions.
 */
const loader = async (
  props: ValidatePermissionsProps,
  _req: Request,
  ctx: AppContext,
): Promise<ExtendedValidationResult> => {
  const allowedTablesBases: AllowedTablesBasesResponse = await ctx
    .invoke["airtable"].loaders.permissioning.listAllowedTablesBases();

  if (allowedTablesBases.allCurrentAndFutureTableBases) {
    if (props.mode === "check") {
      return {
        hasPermission: true,
        message: "User has access to all current and future bases and tables",
      } as PermissionCheck;
    } else if (props.mode === "filter") {
      return {
        filteredProps: props.props,
        filteredResponse: props.response,
      } as ValidationFilterResult;
    } else if (props.mode === "filter-operations") {
      return {
        allowedOperations: props.operations || [],
        deniedOperations: [],
        totalRequested: props.operations?.length || 0,
        totalAllowed: props.operations?.length || 0,
        totalDenied: 0,
      } as FilteredOperationResult;
    }
  }

  if (
    !allowedTablesBases.permission ||
    Object.keys(allowedTablesBases.permission).length === 0
  ) {
    if (props.mode === "check") {
      return { hasPermission: true } as PermissionCheck;
    } else if (props.mode === "filter") {
      return {
        filteredProps: props.props,
        filteredResponse: props.response,
      } as ValidationFilterResult;
    } else if (props.mode === "filter-operations") {
      return {
        allowedOperations: props.operations || [],
        deniedOperations: [],
        totalRequested: props.operations?.length || 0,
        totalAllowed: props.operations?.length || 0,
        totalDenied: 0,
      } as FilteredOperationResult;
    }
  }

  if (props.mode === "check") {
    return validateSpecificPermission(
      allowedTablesBases.permission || {},
      props.baseId,
      props.tableIdOrName,
    );
  }

  if (props.mode === "filter-operations") {
    return filterOperations(
      props.operations || [],
      allowedTablesBases.permission || {},
    );
  }

  if (props.mode === "filter") {
    let filteredProps = props.props;
    let filteredResponse = props.response;

    if (props.props) {
      const propsResult = filterPropsBasedOnPermissions(
        props.props,
        allowedTablesBases.permission || {},
      );

      if (propsResult.error) {
        return {
          error: propsResult.error,
          filteredProps: null,
          filteredResponse: null,
        } as ValidationErrorResult;
      }

      filteredProps = propsResult.props;
    }

    if (props.response) {
      filteredResponse = filterResponseByPermission(
        props.response,
        allowedTablesBases.permission || {},
      );
    }

    return {
      filteredProps,
      filteredResponse,
    } as ValidationFilterResult;
  }

  return {
    error: "Invalid mode. Use 'check', 'filter', or 'filter-operations'",
  };
};

function validateSpecificPermission(
  permission: Record<string, PermissionResult>,
  baseId?: string,
  tableIdOrName?: string,
): PermissionCheck {
  if (baseId) {
    const hasBasePermission = permission[baseId];

    if (!hasBasePermission) {
      return {
        hasPermission: false,
        message: `You don't have permission to access the base ${baseId}`,
      };
    }

    if (tableIdOrName && hasBasePermission.type === "base") {
      const baseWithTables = hasBasePermission as BaseWithTables;
      const hasTablePermission = baseWithTables.tables[tableIdOrName];

      if (!hasTablePermission) {
        return {
          hasPermission: false,
          message:
            `You don't have permission to access the table ${tableIdOrName}`,
        };
      }
    }
  }

  if (tableIdOrName && !baseId) {
    const hasTablePermission = permission[tableIdOrName];

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

function filterPropsBasedOnPermissions(
  props: Record<string, unknown>,
  permission: Record<string, PermissionResult>,
): { props?: Record<string, unknown>; error?: string } {
  if (props.baseId) {
    const hasBasePermission = permission[props.baseId as string];

    if (!hasBasePermission) {
      return {
        error: `You don't have permission to access the base ${props.baseId}`,
      };
    }

    if (props.tableIdOrName && hasBasePermission.type === "base") {
      const baseWithTables = hasBasePermission as BaseWithTables;
      const hasTablePermission =
        baseWithTables.tables[props.tableIdOrName as string];

      if (!hasTablePermission) {
        return {
          error:
            `You don't have permission to access the table ${props.tableIdOrName}`,
        };
      }
    }
  }

  if (props.tableIdOrName && !props.baseId) {
    const hasTablePermission = permission[props.tableIdOrName as string];

    if (!hasTablePermission) {
      return {
        error:
          `You don't have permission to access the table ${props.tableIdOrName}`,
      };
    }
  }

  return { props };
}

function filterResponseByPermission(
  response: ListBasesResponse | ListRecordsResponse | BaseSchemaResponse,
  permission: Record<string, PermissionResult>,
): ListBasesResponse | ListRecordsResponse | BaseSchemaResponse {
  const isBase = "bases" in response;
  const isRecord = "records" in response;
  const isTable = "tables" in response;

  if (isBase) {
    const filteredBases = response.bases.filter((base) => permission[base.id]);
    return { ...response, bases: filteredBases };
  } else if (isRecord) {
    return response;
  } else if (isTable) {
    const filteredTables = response.tables.filter((table) =>
      permission[table.id]
    );
    return { ...response, tables: filteredTables };
  }

  return response;
}

function filterOperations(
  operations: OperationItem[],
  permission: Record<string, PermissionResult>,
): FilteredOperationResult {
  const allowedOperations: OperationItem[] = [];
  const deniedOperations: OperationItem[] = [];

  for (const operation of operations) {
    let hasPermission = false;

    const basePermission = permission[operation.baseId];
    if (basePermission) {
      if (!operation.tableId && !operation.tableIdOrName) {
        hasPermission = true;
      } else {
        const tableIdentifier = operation.tableId || operation.tableIdOrName;
        if (tableIdentifier) {
          if (basePermission.type === "base") {
            const baseWithTables = basePermission as BaseWithTables;
            hasPermission = !!baseWithTables.tables[tableIdentifier];
          } else {
            hasPermission = permission[tableIdentifier] !== undefined;
          }
        }
      }
    }

    if (hasPermission) {
      allowedOperations.push(operation);
    } else {
      deniedOperations.push(operation);
    }
  }

  return {
    allowedOperations,
    deniedOperations,
    totalRequested: operations.length,
    totalAllowed: allowedOperations.length,
    totalDenied: deniedOperations.length,
  };
}

export default loader;
