import { AppContext } from "../../mod.ts";
import {
  BaseSchemaResponse,
  ListBasesResponse,
  ListRecordsResponse,
} from "../../utils/types.ts";

interface PermissionCheck {
  hasPermission: boolean;
  message?: string;
}

interface ValidatePermissionsProps {
  mode: "check" | "filter";
  baseId?: string;
  tableIdOrName?: string;
  props?: Record<string, unknown>;
  response?: ListBasesResponse | ListRecordsResponse | BaseSchemaResponse;
}

/**
 * @name VALIDATE_PERMISSIONS
 * @title Validate User Permissions
 * @description Validates if user has permission to access bases/tables or filters data based on permissions.
 */
const loader = async (
  props: ValidatePermissionsProps,
  _req: Request,
  ctx: AppContext,
) => {
  const allowedTablesBases = await ctx.invoke["airtable"].loaders.permissioning
    .listAllowedTablesBases();

  if (allowedTablesBases.allCurrentAndFutureTableBases) {
    if (props.mode === "check") {
      return {
        hasPermission: true,
        message: "User has access to all current and future bases and tables",
      };
    } else if (props.mode === "filter") {
      return {
        filteredProps: props.props,
        filteredResponse: props.response,
      };
    }
  }

  if (
    !allowedTablesBases.permission ||
    Object.keys(allowedTablesBases.permission).length === 0
  ) {
    if (props.mode === "check") {
      return { hasPermission: true };
    } else if (props.mode === "filter") {
      return {
        filteredProps: props.props,
        filteredResponse: props.response,
      };
    }
  }

  if (props.mode === "check") {
    return validateSpecificPermission(
      allowedTablesBases.permission || {},
      props.baseId,
      props.tableIdOrName,
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
        };
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
    };
  }

  return { error: "Invalid mode. Use 'check' or 'filter'" };
};

function validateSpecificPermission(
  permission: Record<string, any>,
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

    if (tableIdOrName && hasBasePermission.tables) {
      const hasTablePermission = hasBasePermission.tables[tableIdOrName];

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
  permission: Record<string, any>,
): { props?: Record<string, unknown>; error?: string } {
  if (props.baseId) {
    const hasBasePermission = permission[props.baseId as string];

    if (!hasBasePermission) {
      return {
        error: `You don't have permission to access the base ${props.baseId}`,
      };
    }

    if (props.tableIdOrName && hasBasePermission.tables) {
      const hasTablePermission =
        hasBasePermission.tables[props.tableIdOrName as string];

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
  permission: Record<string, any>,
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

export default loader;
